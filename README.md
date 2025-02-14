Task Buddy

Features
Task Management:

Create, update, and delete tasks.

Organize tasks by status (To Do, In Progress, Completed).

Filter tasks by category, due date, and search.

Authentication:

Secure user authentication with Supabase Auth.

Email/password and social login (Google, GitHub, etc.).

Built with Modern Tools:

Next.js for server-side rendering and API routes.

Supabase for backend and database.

Tailwind CSS for styling.

shadcn/ui for beautiful and accessible components.

Full-stack Integration:

Works across the entire Next.js stack (App Router, Pages Router, Middleware, Client, Server).

Supabase Auth with cookie-based sessions for seamless user experiences.

Demo
Check out the live demo of Task Buddy at task-buddy-demo.vercel.app.



Clone and Run Locally
Set up a Supabase Project:

Create a new project in the Supabase Dashboard.

Enable authentication providers (Google ).

Clone the Repository:

bash
Copy
git clone https://github.com/your-repo/task-buddy.git
cd task-buddy
Set Up Environment Variables:

Rename .env.example to .env.local.

Update the following variables with your Supabase project credentials:

env
Copy
NEXT_PUBLIC_SUPABASE_URL=[YOUR_SUPABASE_PROJECT_URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
You can find these credentials in your Supabase project's API settings.

Install Dependencies:

bash
Copy
npm install
Run the Development Server:

bash
Copy
npm run dev
The app will be running at http://localhost:3000.

Customize the UI:

This template comes with shadcn/ui pre-configured. You can customize the components by editing the components.json file or re-installing shadcn/ui.

Feedback and Issues
If you encounter any issues or have feedback, please open an issue on GitHub.

Deploy Link
You can access the deployed version of Task Buddy here:
Task Buddy Demo


