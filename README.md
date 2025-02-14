# Task Buddy

Task Buddy is a full-stack task management application built with modern tools like **Next.js**, **Supabase**, and **Tailwind CSS**. It allows users to create, update, and delete tasks, organize them by status, and filter by category, due date, or search. The app also includes secure user authentication with **Supabase Auth** and supports email/password and social logins (Google, GitHub, etc.).

---

## Features

### Task Management

- Create, update, and delete tasks.
- Organize tasks by status: **To Do**, **In Progress**, **Completed**.
- Filter tasks by category, due date, and search.

### Authentication

- Secure user authentication with **Supabase Auth**.
- Email/password and social login (Google, GitHub, etc.).
- **Google OAuth Consent Screen** setup for seamless Google authentication.

### Built with Modern Tools

- **Next.js** for server-side rendering and API routes.
- **Supabase** for backend and database.
- **Tailwind CSS** for styling.
- **shadcn/ui** for beautiful and accessible components.

### Full-stack Integration

- Works across the entire Next.js stack (App Router, Pages Router, Middleware, Client, Server).
- **Supabase Auth** with cookie-based sessions for seamless user experiences.

---

## Screenshots

### 1. Task Dashboard

 <img alt="Task Byddy List View" src="/public/task1.PNG">

_The main dashboard where users can view, filter, and manage their tasks._

### 2. Task Details

 <img alt="Task Byddy List View" src="/public/task2.PNG">
_Detailed view of a task, including its description, due date, and status._

---

## Demo

Check out the live demo of Task Buddy: [Task Buddy Demo](https://task-buddyy.netlify.app)

---

## Clone and Run Locally

### 1. Set Up a Supabase Project

- Create a new project in the [Supabase Dashboard](https://supabase.com/dashboard).
- Enable authentication providers (Google, GitHub, etc.).

### 2. Set Up Google OAuth Consent Screen

To enable Google authentication, you need to configure the **Google OAuth Consent Screen**:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services > OAuth Consent Screen**.
4. Set the **User Type** to **External** and click **Create**.
5. Fill in the required fields:
   - **App name**: Task Buddy
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
6. Add the **Authorized domains**:
   - `localhost`
   - Your deployment domain (e.g., `task-buddy-demo.vercel.app`)
7. Add **Scopes**:
   - `email`
   - `profile`
   - `openid`
8. Save and submit for verification (if required).

### 3. Configure Google OAuth Credentials

1. Navigate to **APIs & Services > Credentials**.
2. Click **Create Credentials** and select **OAuth 2.0 Client ID**.
3. Set the **Application type** to **Web application**.
4. Add the following **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback`
   - `https://task-buddy-demo.vercel.app/api/auth/callback`
5. Copy the **Client ID** and **Client Secret**.

### 4. Add Google OAuth Credentials to Supabase

1. Go to your Supabase project's **Authentication > Providers**.
2. Enable **Google** and paste the **Client ID** and **Client Secret**.
3. Save the changes.

### 5. Clone the Repository

```bash
git clone https://github.com/subbuparagond/task-buddy.git
cd task-buddy
```

### 6. Set Up Environment Variables

- Rename `.env.example` to `.env.local`.
- Update the following variables with your Supabase project credentials:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=[YOUR_SUPABASE_PROJECT_URL]
  NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
  ```
  You can find these credentials in your Supabase project's **API settings**.

### 7. Install Dependencies

```bash
npm install
```

### 8. Run the Development Server

```bash
npm run dev
```

The app will be running at `http://localhost:3000`.

### 9. Customize the UI

This template comes with **shadcn/ui** pre-configured. You can customize the components by editing the `components.json` file or re-installing shadcn/ui.

---

## Database Schemas

### User Management

#### Create a Table for Public Profiles

```sql
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles
  enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on profiles
  for update using ((select auth.uid()) = id);

-- Trigger to create a profile entry on new user sign-up
create function public.handle_new_user()
returns trigger
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Set up Storage for avatars
insert into storage.buckets (id, name)
  values ('avatars', 'avatars');

-- Set up access controls for storage
create policy "Avatar images are publicly accessible." on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar." on storage.objects
  for insert with check (bucket_id = 'avatars');
```

---

### Task Management

#### Create a Table for Tasks

```sql
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  category text check (category in ('Work', 'Personal')) not null,
  due_date date not null,
  status text check (status in ('To Do', 'In Progress', 'Completed')) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Set up Row Level Security (RLS)
alter table tasks enable row level security;

create policy "Users can view their own tasks." on tasks
  for select using (auth.uid() = user_id);

create policy "Users can insert their own tasks." on tasks
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own tasks." on tasks
  for update using (auth.uid() = user_id);

create policy "Users can delete their own tasks." on tasks
  for delete using (auth.uid() = user_id);

-- Index for sorting by due date
create index on tasks (due_date);

-- Trigger to update the updated_at timestamp
create function public.handle_task_update()
returns trigger
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger on_task_updated
  before update on tasks
  for each row execute procedure public.handle_task_update();
```

#### Create a Table for Task Tags

```sql
create table task_tags (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks on delete cascade not null,
  tag text not null
);

-- Index for faster tag queries
create index on task_tags (task_id);
```

#### Create a Table for Task Attachments

```sql
create table task_attachments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks on delete cascade not null,
  file_url text not null,
  uploaded_at timestamp with time zone default now()
);

-- Set up Storage for task attachments
insert into storage.buckets (id, name)
  values ('task_attachments', 'task_attachments');

-- Set up access controls for storage
create policy "Users can upload task attachments." on storage.objects
  for insert with check (bucket_id = 'task_attachments');

create policy "Users can view their own task attachments." on storage.objects
  for select using (bucket_id = 'task_attachments');
```

---

### Activity Logs

#### Create a Table for Activity Logs

```sql
create table activity_logs (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  action text check (action in ('Created', 'Updated', 'Deleted')) not null,
  description text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS and policies
alter table activity_logs enable row level security;

create policy "Users can view their own activity logs." on activity_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert activity logs for their own tasks." on activity_logs
  for insert with check (auth.uid() = user_id);
```

#### Trigger Function for Activity Logs

```sql
create function public.log_task_activity()
returns trigger
language plpgsql
as $$
declare
  action_text text;
  description_text text;
begin
  if (tg_op = 'INSERT') then
    action_text := 'Created';
    description_text := 'Task "' || new.title || '" was created.';
  elsif (tg_op = 'UPDATE') then
    action_text := 'Updated';
    description_text := 'Task "' || new.title || '" was updated.';
  end if;

  insert into activity_logs (task_id, user_id, action, description)
  values (coalesce(new.id, old.id), coalesce(new.user_id, old.user_id), action_text, description_text);

  return new;
end;
$$ security definer;

create trigger on_task_change
  after insert or update on tasks
  for each row
  execute function public.log_task_activity();
```

---

## Feedback and Issues

If you encounter any issues or have feedback, please open an issue on [GitHub](https://github.com/your-repo/task-buddy/issues).

---

## Deploy Link

You can access the deployed version of Task Buddy here: [Task Buddy Demo](https://task-buddyy.netlify.app)

---
