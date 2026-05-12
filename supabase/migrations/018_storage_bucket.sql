-- Migration 018: Create store-assets storage bucket and RLS policies

INSERT INTO storage.buckets (id, name, public)
VALUES ('store-assets', 'store-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "store_assets_owner_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'store-assets'
    AND (storage.foldername(name))[1] = (auth.jwt() ->> 'tenant_id')
  );

CREATE POLICY "store_assets_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'store-assets');

CREATE POLICY "store_assets_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'store-assets'
    AND (storage.foldername(name))[1] = (auth.jwt() ->> 'tenant_id')
  );
