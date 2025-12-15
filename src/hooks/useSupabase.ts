import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Custom hook for direct Supabase database access
 * This provides a convenient way to access Supabase client with authentication context
 */
export const useSupabase = () => {
  const { user, session } = useAuth();

  /**
   * Get data from a table with optional filters
   * @param table - The table name
   * @param select - Columns to select (default: '*')
   * @param filters - Optional filters to apply
   */
  const getData = async <T = unknown>(
    table: string,
    select = "*",
    filters?: Record<string, string | number | boolean>,
  ): Promise<{ data: T[] | null; error: PostgrestError | null }> => {
    let query = supabase.from(table).select(select);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query;
    return { data: data as T[] | null, error };
  };

  /**
   * Insert data into a table
   * @param table - The table name
   * @param data - The data to insert
   */
  const insertData = async <T = unknown>(
    table: string,
    data: Record<string, unknown>,
  ): Promise<{ data: T | null; error: PostgrestError | null }> => {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();

    return { data: result as T | null, error };
  };

  /**
   * Update data in a table
   * @param table - The table name
   * @param id - The record ID to update
   * @param data - The data to update
   */
  const updateData = async <T = unknown>(
    table: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<{ data: T | null; error: PostgrestError | null }> => {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq("id", id)
      .select()
      .single();

    return { data: result as T | null, error };
  };

  /**
   * Delete data from a table
   * @param table - The table name
   * @param id - The record ID to delete
   */
  const deleteData = async (
    table: string,
    id: string,
  ): Promise<{ error: PostgrestError | null }> => {
    const { error } = await supabase.from(table).delete().eq("id", id);

    return { error };
  };

  /**
   * Upload a file to Supabase Storage
   * @param bucket - The storage bucket name
   * @param path - The file path within the bucket
   * @param file - The file to upload
   */
  const uploadFile = async (
    bucket: string,
    path: string,
    file: File,
  ): Promise<{ data: { path: string } | null; error: Error | null }> => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: false,
      });

    return { data, error };
  };

  /**
   * Get public URL for a file in storage
   * @param bucket - The storage bucket name
   * @param path - The file path within the bucket
   */
  const getFileUrl = (bucket: string, path: string): string => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  /**
   * Delete a file from storage
   * @param bucket - The storage bucket name
   * @param path - The file path within the bucket
   */
  const deleteFile = async (
    bucket: string,
    path: string,
  ): Promise<{ error: Error | null }> => {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    return { error };
  };

  /**
   * Execute a custom query using Supabase client
   * This gives you full access to the Supabase client for complex queries
   */
  const executeQuery = () => supabase;

  return {
    supabase,
    user,
    session,
    getData,
    insertData,
    updateData,
    deleteData,
    uploadFile,
    getFileUrl,
    deleteFile,
    executeQuery,
  };
};
