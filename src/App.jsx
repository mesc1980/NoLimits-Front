/**
 * App.jsx — Router principal de no/limits.
 * Rutas:
 *  /             → Home
 *  /search       → SearchResults
 *  /detail/:id   → Detail
 *  /my-list      → MyList
 *  /saga/:name   → Saga (curada o genérica)
 *  /login        → Login
 *  /terms        → Términos y condiciones
 */

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword  from '@/pages/ResetPassword';
import Layout        from '@/components/layout/Layout';
import Home          from '@/pages/Home';
import SearchResults from '@/pages/SearchResults';
import Detail        from '@/pages/Detail';
import MyList        from '@/pages/MyList';
import Saga          from '@/pages/Saga';
import Login         from '@/pages/Login';
import Terms         from '@/pages/Terms';
import AuthCallback  from '@/pages/AuthCallback';

const router = createBrowserRouter([
  {
    path:    '/',
    element: <Layout />,
    children: [
      { index: true,             element: <Home />          },
      { path: 'search',          element: <SearchResults /> },
      { path: 'detail/:mediaId', element: <Detail />        },
      { path: 'my-list',         element: <MyList />        },
      { path: 'saga/:sagaName',  element: <Saga />          },
      { path: 'saga',            element: <Saga />          },
      
      { path: 'login',           element: <Login />         },
      { path: 'forgot-password', element: <ForgotPassword /> },
    
      { path: 'terms',           element: <Terms />         },
      // Callback de Google/Supabase
      { path: 'auth/callback',   element: <AuthCallback />  },
    ],
  },

  { path: 'reset-password',  element: <ResetPassword />  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;