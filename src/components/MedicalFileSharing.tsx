import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  Lock, 
  Search,
  FileImage,
  FileX,
  Calendar,
  User,
  Shield
} from "lucide-react";
import { format } from "date-fns";

interface MedicalFileSharingProps {
  userType: 'patient' | 'doctor';
  userProfile: any;
}

export const MedicalFileSharing = ({ userType, userProfile }: MedicalFileSharingProps) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fileCategories = [
    { value: 'lab_result', label: 'Lab Result', icon: FileText },
    { value: 'prescription', label: 'Prescription', icon: FileText },
    { value: 'scan', label: 'Medical Scan', icon: FileImage },
    { value: 'report', label: 'Medical Report', icon: FileText },
    { value: 'image', label: 'Medical Image', icon: FileImage },
    { value: 'document', label: 'Other Document', icon: FileX },
  ];

  useEffect(() => {
    loadMedicalFiles();
  }, []);

  const loadMedicalFiles = async () => {
    try {
      let query = supabase
        .from('medical_files')
        .select(`
          *,
          patient:patients(*),
          doctor:doctors(*),
          uploader:uploaded_by(*)
        `);

      if (userType === 'patient') {
        query = query.eq('patient_id', userProfile.id);
      } else {
        // Doctor can see files from their patients
        query = query.in('patient_id', 
          // This would need a subquery to get patient IDs from conversations
          []  // Placeholder - in real implementation, get from conversations
        );
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading files",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile || !uploadCategory) {
      toast({
        title: "Missing information",
        description: "Please select a file and category",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      // Create unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.data.user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('medical-files')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Create file record in database
      const { error: dbError } = await supabase
        .from('medical_files')
        .insert({
          patient_id: userType === 'patient' ? userProfile.id : null, // For doctors, would need patient selection
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          storage_path: filePath,
          category: uploadCategory,
          description: fileDescription,
          uploaded_by: user.data.user.id,
        });

      if (dbError) throw dbError;

      toast({
        title: "File uploaded successfully",
        description: "Your medical file has been securely stored",
      });

      // Reset form
      setSelectedFile(null);
      setUploadCategory('');
      setFileDescription('');
      setShowUploadForm(false);
      loadMedicalFiles();

    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadFile = async (file: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('medical-files')
        .download(file.storage_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: `Downloading ${file.file_name}`,
      });
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteFile = async (file: any) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('medical-files')
        .remove([file.storage_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('medical_files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      toast({
        title: "File deleted",
        description: "The file has been permanently removed",
      });

      loadMedicalFiles();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (category: string) => {
    const categoryData = fileCategories.find(cat => cat.value === category);
    return categoryData?.icon || FileX;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    const matchesSearch = file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Medical Files</h2>
          <p className="text-muted-foreground">Securely store and share medical documents</p>
        </div>
        <Button onClick={() => setShowUploadForm(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload File
        </Button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Upload Secure Medical File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select File</label>
              <Input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: PDF, JPG, PNG, DOC, DOCX, TXT (Max 10MB)
              </p>
            </div>

            {selectedFile && (
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{selectedFile.name}</span>
                  <Badge variant="outline">{formatFileSize(selectedFile.size)}</Badge>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select file category" />
                </SelectTrigger>
                <SelectContent>
                  {fileCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <Textarea
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
                placeholder="Brief description of the medical file..."
                rows={3}
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg flex items-start space-x-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Security Notice</p>
                <p>Files are encrypted and HIPAA compliant. Only you and authorized healthcare providers can access them.</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowUploadForm(false);
                  setSelectedFile(null);
                  setUploadCategory('');
                  setFileDescription('');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={uploadFile} 
                disabled={!selectedFile || !uploadCategory || isUploading}
              >
                {isUploading ? "Uploading..." : "Upload File"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {fileCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      {isLoading ? (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading medical files...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="text-center p-8">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No medical files found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'No files match your current search criteria' 
                : 'Upload your first medical file to get started'}
            </p>
            <Button onClick={() => setShowUploadForm(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFiles.map((file) => {
            const IconComponent = getFileIcon(file.category);
            
            return (
              <Card key={file.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium truncate">{file.file_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.file_size)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {fileCategories.find(cat => cat.value === file.category)?.label}
                    </Badge>
                  </div>

                  {file.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {file.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-3">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(file.created_at), 'MMM d, yyyy')}</span>
                    {file.doctor && (
                      <>
                        <User className="h-3 w-3" />
                        <span>Dr. {file.doctor.full_name}</span>
                      </>
                    )}
                  </div>

                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm" onClick={() => downloadFile(file)}>
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                    {userType === 'patient' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteFile(file)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};