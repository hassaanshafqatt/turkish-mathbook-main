# Usage Examples

This document provides practical examples of using authentication and database access in the Turkish Math Book application.

## Table of Contents

- [Authentication Examples](#authentication-examples)
- [Database Access Examples](#database-access-examples)
- [Storage Examples](#storage-examples)
- [Real-World Scenarios](#real-world-scenarios)

## Authentication Examples

### Example 1: Check if User is Authenticated

```tsx
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in to continue</div>;
  }

  return <div>Welcome, {user.email}!</div>;
};
```

### Example 2: Sign In Form with Validation

```tsx
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SignInForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Sign In Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success!',
        description: 'You have been signed in.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Sign In</button>
    </form>
  );
};
```

### Example 3: Conditional Rendering Based on Auth State

```tsx
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>User ID: {user.id}</p>
      <p>Email: {user.email}</p>
      <p>Email Verified: {user.email_confirmed_at ? 'Yes' : 'No'}</p>
    </div>
  );
};
```

### Example 4: Sign Out with Confirmation

```tsx
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SignOutButton = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button>Sign Out</button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be signed out of your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSignOut}>
            Sign Out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
```

## Database Access Examples

### Example 1: Fetch User's Documents

```tsx
import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
}

const MyDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { getData, user } = useSupabase();
  const { toast } = useToast();

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) return;

      const { data, error } = await getData<Document>(
        'documents',
        '*',
        { user_id: user.id }
      );

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setDocuments(data || []);
      }

      setLoading(false);
    };

    fetchDocuments();
  }, [user]);

  if (loading) return <div>Loading documents...</div>;

  return (
    <div>
      <h2>My Documents</h2>
      {documents.length === 0 ? (
        <p>No documents found</p>
      ) : (
        <ul>
          {documents.map((doc) => (
            <li key={doc.id}>
              <h3>{doc.title}</h3>
              <p>{doc.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

### Example 2: Create New Document

```tsx
import { useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';

const CreateDocument = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { insertData, user } = useSupabase();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const { data, error } = await insertData('documents', {
      user_id: user.id,
      title,
      content,
      created_at: new Date().toISOString(),
    });

    setLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Document created successfully',
      });
      setTitle('');
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Document title"
        required
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Document content"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Document'}
      </button>
    </form>
  );
};
```

### Example 3: Update Document

```tsx
import { useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';

interface EditDocumentProps {
  documentId: string;
  initialTitle: string;
  initialContent: string;
  onSuccess?: () => void;
}

const EditDocument = ({
  documentId,
  initialTitle,
  initialContent,
  onSuccess,
}: EditDocumentProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const { updateData } = useSupabase();
  const { toast } = useToast();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await updateData('documents', documentId, {
      title,
      content,
      updated_at: new Date().toISOString(),
    });

    setLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Document updated successfully',
      });
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleUpdate}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Document title"
        required
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Document content"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Document'}
      </button>
    </form>
  );
};
```

### Example 4: Delete Document

```tsx
import { useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';

interface DeleteDocumentButtonProps {
  documentId: string;
  onDelete?: () => void;
}

const DeleteDocumentButton = ({
  documentId,
  onDelete,
}: DeleteDocumentButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { deleteData } = useSupabase();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setLoading(true);

    const { error } = await deleteData('documents', documentId);

    setLoading(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
      onDelete?.();
    }
  };

  return (
    <button onClick={handleDelete} disabled={loading}>
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  );
};
```

## Storage Examples

### Example 1: Upload File

```tsx
import { useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';

const FileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { uploadFile, user } = useSupabase();
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);

    // Create a unique file path
    const fileName = `${user.id}/${Date.now()}-${file.name}`;

    const { data, error } = await uploadFile('documents', fileName, file);

    setUploading(false);

    if (error) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      });
      console.log('Uploaded file path:', data?.path);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
};
```

### Example 2: Display Uploaded Images

```tsx
import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';

interface Image {
  id: string;
  file_path: string;
  name: string;
}

const ImageGallery = () => {
  const [images, setImages] = useState<Image[]>([]);
  const { getData, getFileUrl } = useSupabase();

  useEffect(() => {
    const fetchImages = async () => {
      const { data } = await getData<Image>('images', '*');
      if (data) setImages(data);
    };

    fetchImages();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((image) => (
        <div key={image.id}>
          <img
            src={getFileUrl('images', image.file_path)}
            alt={image.name}
            className="w-full h-48 object-cover"
          />
          <p>{image.name}</p>
        </div>
      ))}
    </div>
  );
};
```

### Example 3: Delete Uploaded File

```tsx
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';

interface DeleteFileButtonProps {
  bucket: string;
  filePath: string;
  onDelete?: () => void;
}

const DeleteFileButton = ({ bucket, filePath, onDelete }: DeleteFileButtonProps) => {
  const { deleteFile } = useSupabase();
  const { toast } = useToast();

  const handleDelete = async () => {
    const { error } = await deleteFile(bucket, filePath);

    if (error) {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'File deleted successfully',
      });
      onDelete?.();
    }
  };

  return (
    <button onClick={handleDelete} className="text-red-600">
      Delete File
    </button>
  );
};
```

## Real-World Scenarios

### Scenario 1: User Profile Management

```tsx
import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  bio: string;
  avatar_url?: string;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const { getData, updateData, insertData } = useSupabase();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await getData<UserProfile>(
        'user_profiles',
        '*',
        { user_id: user.id }
      );

      if (data && data.length > 0) {
        setProfile(data[0]);
        setFullName(data[0].full_name);
        setBio(data[0].bio);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    if (profile) {
      // Update existing profile
      const { error } = await updateData('user_profiles', profile.id, {
        full_name: fullName,
        bio: bio,
      });

      if (!error) {
        toast({ title: 'Profile updated successfully' });
      }
    } else {
      // Create new profile
      const { error } = await insertData('user_profiles', {
        user_id: user.id,
        full_name: fullName,
        bio: bio,
      });

      if (!error) {
        toast({ title: 'Profile created successfully' });
      }
    }

    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>My Profile</h1>
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div>
          <label>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>
          Save Profile
        </button>
      </form>
    </div>
  );
};
```

### Scenario 2: Real-time Document Collaboration

```tsx
import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';

interface Document {
  id: string;
  title: string;
  content: string;
  updated_at: string;
}

const CollaborativeEditor = ({ documentId }: { documentId: string }) => {
  const [document, setDocument] = useState<Document | null>(null);
  const { executeQuery } = useSupabase();

  useEffect(() => {
    // Fetch initial document
    const fetchDocument = async () => {
      const { data } = await executeQuery()
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (data) setDocument(data);
    };

    fetchDocument();

    // Subscribe to real-time changes
    const subscription = executeQuery()
      .channel('document-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'documents',
          filter: `id=eq.${documentId}`,
        },
        (payload) => {
          setDocument(payload.new as Document);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [documentId]);

  const handleContentChange = async (newContent: string) => {
    if (!document) return;

    await executeQuery()
      .from('documents')
      .update({ content: newContent, updated_at: new Date().toISOString() })
      .eq('id', documentId);
  };

  if (!document) return <div>Loading...</div>;

  return (
    <div>
      <h1>{document.title}</h1>
      <textarea
        value={document.content}
        onChange={(e) => handleContentChange(e.target.value)}
        style={{ width: '100%', height: '400px' }}
      />
      <p>Last updated: {new Date(document.updated_at).toLocaleString()}</p>
    </div>
  );
};
```

### Scenario 3: User Settings with Persistence

```tsx
import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/contexts/AuthContext';

interface UserSettings {
  theme: 'light' | 'dark';
  language: 'en' | 'tr';
  notifications: boolean;
}

const SettingsPage = () => {
  const { user } = useAuth();
  const { getData, updateData, insertData } = useSupabase();
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light',
    language: 'en',
    notifications: true,
  });
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      const { data } = await getData('user_settings', '*', {
        user_id: user.id,
      });

      if (data && data.length > 0) {
        setSettings({
          theme: data[0].theme,
          language: data[0].language,
          notifications: data[0].notifications,
        });
        setSettingsId(data[0].id);
      }
    };

    loadSettings();
  }, [user]);

  const saveSettings = async () => {
    if (!user) return;

    if (settingsId) {
      await updateData('user_settings', settingsId, settings);
    } else {
      const { data } = await insertData('user_settings', {
        user_id: user.id,
        ...settings,
      });
      if (data) setSettingsId(data.id);
    }
  };

  return (
    <div>
      <h1>Settings</h1>
      <div>
        <label>
          Theme:
          <select
            value={settings.theme}
            onChange={(e) =>
              setSettings({ ...settings, theme: e.target.value as 'light' | 'dark' })
            }
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Language:
          <select
            value={settings.language}
            onChange={(e) =>
              setSettings({ ...settings, language: e.target.value as 'en' | 'tr' })
            }
          >
            <option value="en">English</option>
            <option value="tr">Turkish</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) =>
              setSettings({ ...settings, notifications: e.target.checked })
            }
          />
          Enable Notifications
        </label>
      </div>
      <button onClick={saveSettings}>Save Settings</button>
    </div>
  );
};
```

## Tips and Best Practices

1. **Always check for user authentication** before making database calls
2. **Handle loading states** to improve user experience
3. **Display error messages** using toast notifications
4. **Use TypeScript generics** for type-safe database operations
5. **Implement optimistic updates** for better perceived performance
6. **Clean up subscriptions** in useEffect cleanup functions
7. **Validate data** before submitting to the database
8. **Use RLS policies** to secure your data at the database level
9. **Cache data** when appropriate to reduce API calls
10. **Test edge cases** like network failures and concurrent updates

## Additional Resources

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [React Query Integration](https://tanstack.com/query/latest/docs/react/overview)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)