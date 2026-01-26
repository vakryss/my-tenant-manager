import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://jpjybbldgtwlmisjnzkc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwanliYmxkZ3R3bG1pc2puemtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNTcxODksImV4cCI6MjA4NDkzMzE4OX0.qTU0G7PM5xlIr5ozNTob0glv8w_iQvTeldrGNuhczkw";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

window.supabase = supabase;
