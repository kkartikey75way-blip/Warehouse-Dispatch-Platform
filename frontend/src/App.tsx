import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { router } from "./router";
import { SocketProvider } from "./contexts/SocketProvider";

import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Provider store={store}>
      <SocketProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontSize: '11px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              padding: '16px 24px',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
          containerStyle={{
            top: 40,
            right: 40,
            zIndex: 99999,
          }}
        />
      </SocketProvider>
    </Provider>
  );
}

export default App;
