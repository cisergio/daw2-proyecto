import { type FC } from "react";
import { Outlet } from "react-router-dom";

const Layout: FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Contenedor principal que se ajusta al lado del sidebar en escritorio */}
      <div className="flex flex-1 flex-col overflow-y-auto lg:ml-64">
        {/* 
          Encabezado para móviles (lg:hidden) con el botón de hamburguesa.
          Este encabezado está "pegajoso" (sticky) en la parte superior.
        */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden">
          {/* Logo y Nombre (solo para la barra superior móvil) */}
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 p-2 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="white"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.251.023.501.05.75.082m.75.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082m-1.5 0c.251.023.501.05.75.082m0 0c.251.023.501.05.75.082M12 21v-8.283m0 0c.251.023.501.05.75.082m-1.5 0c.251.023.501.05.75.082m0 0c.251.023.501.05.75.082"
                />
              </svg>
            </span>
            <span className="text-lg font-semibold text-gray-800">MiPanel</span>
          </div>
        </header>

        {/* 
          El <Outlet /> es el marcador de posición de react-router-dom. 
          Aquí se renderizará el componente de la página actual (Dashboard, Clientes, etc.).
          Añadimos un padding generoso para dar espacio al contenido.
        */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
