-- Create webhooks table (admin/owner only)
CREATE TABLE IF NOT EXISTS public.webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    active BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create voices table (admin/owner managed, but users can read)
CREATE TABLE IF NOT EXISTS public.voices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voice_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table (per-user settings)
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_language CHECK (language IN ('en', 'tr'))
);

-- Enable Row Level Security
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Webhooks Policies (admin/owner only)
CREATE POLICY "Only admins and owners can read webhooks"
    ON public.webhooks
    FOR SELECT
    USING (public.is_admin_or_owner(auth.uid()));

CREATE POLICY "Only admins and owners can insert webhooks"
    ON public.webhooks
    FOR INSERT
    WITH CHECK (public.is_admin_or_owner(auth.uid()));

CREATE POLICY "Only admins and owners can update webhooks"
    ON public.webhooks
    FOR UPDATE
    USING (public.is_admin_or_owner(auth.uid()));

CREATE POLICY "Only admins and owners can delete webhooks"
    ON public.webhooks
    FOR DELETE
    USING (public.is_admin_or_owner(auth.uid()));

-- Voices Policies (admin/owner manage, all authenticated users can read)
CREATE POLICY "All authenticated users can read voices"
    ON public.voices
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins and owners can insert voices"
    ON public.voices
    FOR INSERT
    WITH CHECK (public.is_admin_or_owner(auth.uid()));

CREATE POLICY "Only admins and owners can update voices"
    ON public.voices
    FOR UPDATE
    USING (public.is_admin_or_owner(auth.uid()));

CREATE POLICY "Only admins and owners can delete voices"
    ON public.voices
    FOR DELETE
    USING (public.is_admin_or_owner(auth.uid()));

-- User Preferences Policies (users can only manage their own)
CREATE POLICY "Users can read own preferences"
    ON public.user_preferences
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
    ON public.user_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON public.user_preferences
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
    ON public.user_preferences
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER on_webhooks_updated
    BEFORE UPDATE ON public.webhooks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_voices_updated
    BEFORE UPDATE ON public.voices
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_user_preferences_updated
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create function to automatically create user preferences on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_preferences (user_id, language)
    VALUES (NEW.id, 'en')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS on_user_preferences_created ON auth.users;
CREATE TRIGGER on_user_preferences_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_preferences();

-- Create indexes
CREATE INDEX IF NOT EXISTS webhooks_active_idx ON public.webhooks(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS webhooks_created_by_idx ON public.webhooks(created_by);
CREATE INDEX IF NOT EXISTS voices_voice_id_idx ON public.voices(voice_id);
CREATE INDEX IF NOT EXISTS voices_created_by_idx ON public.voices(created_by);
CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON public.user_preferences(user_id);

-- Grant necessary permissions
GRANT SELECT ON public.webhooks TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.webhooks TO authenticated;

GRANT SELECT ON public.voices TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.voices TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;

-- Create helper function to get active webhook (for convenience)
CREATE OR REPLACE FUNCTION public.get_active_webhook()
RETURNS TABLE (
    id UUID,
    name TEXT,
    url TEXT,
    active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT id, name, url, active, created_at
    FROM public.webhooks
    WHERE active = true
    ORDER BY created_at DESC
    LIMIT 1;
$$;

-- Create helper function to check if only one webhook can be active
CREATE OR REPLACE FUNCTION public.enforce_single_active_webhook()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.active = true THEN
        -- Deactivate all other webhooks
        UPDATE public.webhooks
        SET active = false
        WHERE id != NEW.id AND active = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce single active webhook
DROP TRIGGER IF EXISTS enforce_single_active_webhook_trigger ON public.webhooks;
CREATE TRIGGER enforce_single_active_webhook_trigger
    BEFORE INSERT OR UPDATE ON public.webhooks
    FOR EACH ROW
    WHEN (NEW.active = true)
    EXECUTE FUNCTION public.enforce_single_active_webhook();

-- Comment on tables for documentation
COMMENT ON TABLE public.webhooks IS 'Stores n8n webhook configurations (admin/owner only)';
COMMENT ON TABLE public.voices IS 'Stores available AI voices for narration (admin/owner managed, all users can read)';
COMMENT ON TABLE public.user_preferences IS 'Stores per-user preferences like language settings';

COMMENT ON COLUMN public.webhooks.active IS 'Only one webhook can be active at a time';
COMMENT ON COLUMN public.voices.voice_id IS 'External voice ID from the AI service (e.g., ElevenLabs)';
COMMENT ON COLUMN public.user_preferences.language IS 'User interface language preference (en or tr)';
