/*
  # Create document signatures table for SignRequest integration

  1. New Tables
    - `document_signatures`
      - `id` (uuid, primary key)
      - `application_id` (uuid, not null)
      - `document_type` (text, not null)
      - `signrequest_document_id` (text)
      - `signrequest_signer_id` (text)
      - `status` (text, default 'pending')
      - `document_url` (text)
      - `signing_url` (text)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
      - Unique constraint on (application_id, document_type)

  2. Security
    - Enable RLS on `document_signatures` table
    - Add policy for authenticated users to access their own records
*/

-- Create the document_signatures table
CREATE TABLE IF NOT EXISTS public.document_signatures (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid NOT NULL,
    document_type text NOT NULL,
    signrequest_document_id text,
    signrequest_signer_id text,
    status text NOT NULL DEFAULT 'pending',
    document_url text,
    signing_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT unique_app_doc_type UNIQUE (application_id, document_type)
);

-- Enable Row Level Security
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow authenticated user access"
ON public.document_signatures
FOR ALL
TO authenticated
USING (auth.uid() = (SELECT nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid)
WITH CHECK (auth.uid() = (SELECT nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid);