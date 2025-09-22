-- Create MedConnect database schema
-- Patient profiles table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  blood_type TEXT,
  phone TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_conditions TEXT[],
  allergies TEXT[],
  medications TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Doctor profiles table  
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  license_number TEXT NOT NULL UNIQUE,
  phone TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  consultation_rate DECIMAL(10,2),
  years_experience INTEGER,
  bio TEXT,
  languages TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Medical conversations/chats
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Medical Consultation',
  status TEXT CHECK (status IN ('active', 'ended', 'archived')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_id, doctor_id)
);

-- Secure messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type TEXT CHECK (sender_type IN ('patient', 'doctor')) NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'file', 'voice', 'video')) DEFAULT 'text',
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  is_encrypted BOOLEAN DEFAULT true,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Video consultations
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
  meeting_url TEXT,
  recording_url TEXT,
  notes TEXT,
  prescription TEXT,
  diagnosis TEXT,
  follow_up_date DATE,
  cost DECIMAL(10,2),
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded')) DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Medical files and documents
CREATE TABLE public.medical_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  category TEXT CHECK (category IN ('lab_result', 'prescription', 'scan', 'report', 'image', 'document')) NOT NULL,
  description TEXT,
  is_sensitive BOOLEAN DEFAULT true,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Emergency broadcasts
CREATE TABLE public.emergency_broadcasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  broadcast_type TEXT CHECK (broadcast_type IN ('medical_emergency', 'urgent_care', 'medication_alert', 'general')) NOT NULL,
  severity INTEGER CHECK (severity BETWEEN 1 AND 10) NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_address TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  recipients_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Broadcast recipients (doctors who received the broadcast)
CREATE TABLE public.broadcast_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broadcast_id UUID NOT NULL REFERENCES public.emergency_broadcasts(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('sent', 'delivered', 'read', 'responded')) DEFAULT 'sent',
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(broadcast_id, doctor_id)
);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_recipients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients
CREATE POLICY "Patients can view their own profile" ON public.patients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Patients can update their own profile" ON public.patients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Patients can insert their own profile" ON public.patients FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for doctors  
CREATE POLICY "Doctors can view their own profile" ON public.doctors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Doctors can update their own profile" ON public.doctors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Doctors can insert their own profile" ON public.doctors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can view verified doctors" ON public.doctors FOR SELECT USING (is_verified = true);

-- RLS Policies for conversations
CREATE POLICY "Patients can view their conversations" ON public.conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.patients WHERE id = patient_id AND user_id = auth.uid())
);
CREATE POLICY "Doctors can view their conversations" ON public.conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.doctors WHERE id = doctor_id AND user_id = auth.uid())
);
CREATE POLICY "Patients can create conversations" ON public.conversations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.patients WHERE id = patient_id AND user_id = auth.uid())
);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    LEFT JOIN public.patients p ON c.patient_id = p.id
    LEFT JOIN public.doctors d ON c.doctor_id = d.id
    WHERE c.id = conversation_id 
    AND (p.user_id = auth.uid() OR d.user_id = auth.uid())
  )
);
CREATE POLICY "Users can send messages to their conversations" ON public.messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    LEFT JOIN public.patients p ON c.patient_id = p.id
    LEFT JOIN public.doctors d ON c.doctor_id = d.id
    WHERE c.id = conversation_id 
    AND (p.user_id = auth.uid() OR d.user_id = auth.uid())
  )
  AND sender_id = auth.uid()
);

-- RLS Policies for consultations
CREATE POLICY "Users can view their consultations" ON public.consultations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    LEFT JOIN public.patients p ON c.patient_id = p.id
    LEFT JOIN public.doctors d ON c.doctor_id = d.id
    WHERE c.id = conversation_id 
    AND (p.user_id = auth.uid() OR d.user_id = auth.uid())
  )
);
CREATE POLICY "Doctors can create consultations" ON public.consultations FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    JOIN public.doctors d ON c.doctor_id = d.id
    WHERE c.id = conversation_id AND d.user_id = auth.uid()
  )
);
CREATE POLICY "Doctors can update their consultations" ON public.consultations FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    JOIN public.doctors d ON c.doctor_id = d.id
    WHERE c.id = conversation_id AND d.user_id = auth.uid()
  )
);

-- RLS Policies for medical files
CREATE POLICY "Patients can view their medical files" ON public.medical_files FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.patients WHERE id = patient_id AND user_id = auth.uid())
);
CREATE POLICY "Doctors can view files from their patients" ON public.medical_files FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    JOIN public.doctors d ON c.doctor_id = d.id
    WHERE c.patient_id = patient_id AND d.user_id = auth.uid()
  )
);
CREATE POLICY "Users can upload medical files" ON public.medical_files FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- RLS Policies for emergency broadcasts
CREATE POLICY "Patients can create emergency broadcasts" ON public.emergency_broadcasts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.patients WHERE id = patient_id AND user_id = auth.uid())
);
CREATE POLICY "Patients can view their broadcasts" ON public.emergency_broadcasts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.patients WHERE id = patient_id AND user_id = auth.uid())
);
CREATE POLICY "Doctors can view broadcasts" ON public.emergency_broadcasts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.doctors WHERE user_id = auth.uid() AND is_verified = true)
);

-- RLS Policies for broadcast recipients
CREATE POLICY "Doctors can view their broadcast responses" ON public.broadcast_recipients FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.doctors WHERE id = doctor_id AND user_id = auth.uid())
);

-- Create storage bucket for medical files
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-files', 'medical-files', false);

-- Storage policies for medical files
CREATE POLICY "Users can view their medical files" ON storage.objects FOR SELECT USING (
  bucket_id = 'medical-files' AND (
    -- Patient can view their own files
    (storage.foldername(name))[1] = auth.uid()::text OR
    -- Doctor can view files they have access to
    EXISTS (
      SELECT 1 FROM public.medical_files mf 
      JOIN public.conversations c ON c.patient_id = mf.patient_id
      JOIN public.doctors d ON d.id = c.doctor_id
      WHERE d.user_id = auth.uid() AND mf.storage_path = name
    )
  )
);

CREATE POLICY "Users can upload medical files" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'medical-files' AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create indexes for performance
CREATE INDEX idx_patients_user_id ON public.patients(user_id);
CREATE INDEX idx_doctors_user_id ON public.doctors(user_id);
CREATE INDEX idx_doctors_specialization ON public.doctors(specialization);
CREATE INDEX idx_conversations_patient_doctor ON public.conversations(patient_id, doctor_id);
CREATE INDEX idx_messages_conversation_created ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_consultations_scheduled ON public.consultations(scheduled_at);
CREATE INDEX idx_medical_files_patient ON public.medical_files(patient_id);
CREATE INDEX idx_emergency_broadcasts_created ON public.emergency_broadcasts(created_at DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON public.consultations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_emergency_broadcasts_updated_at BEFORE UPDATE ON public.emergency_broadcasts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();