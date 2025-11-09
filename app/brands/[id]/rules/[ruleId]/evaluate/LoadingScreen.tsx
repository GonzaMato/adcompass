"use client";

import { Card } from "@/app/components/Card";
import { BackgroundGradient } from "@/app/components/ui/BackgroundGradient";

type Props = {
  loadingProgress: number;
};

export default function LoadingScreen({ loadingProgress }: Props) {
  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <BackgroundGradient>
          <Card className="bg-neutral-900 border-neutral-800 p-8 md:p-12">
            <div className="text-center space-y-8">
              {/* Spinner animado */}
              <div className="flex justify-center">
                <div className="relative w-32 h-32">
                  {/* Círculo exterior */}
                  <div className="absolute inset-0 border-8 border-neutral-800 rounded-full"></div>
                  {/* Círculo animado */}
                  <div 
                    className="absolute inset-0 border-8 border-transparent border-t-purple-500 border-r-purple-500 rounded-full animate-spin"
                    style={{ animationDuration: '1.5s' }}
                  ></div>
                  {/* Círculo interior con pulso */}
                  <div className="absolute inset-4 bg-purple-500/20 rounded-full animate-pulse"></div>
                  {/* Porcentaje */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {Math.round(loadingProgress)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Título y descripción */}
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-white">
                  Evaluando tu asset...
                </h2>
                <p className="text-neutral-400 text-lg">
                  Nuestro sistema está analizando el contenido según las reglas de marca
                </p>
              </div>

              {/* Barra de progreso */}
              <div className="space-y-2">
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-neutral-500">
                  Esto puede tomar algunos momentos...
                </p>
              </div>

              {/* Indicadores de proceso */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className={`flex flex-col items-center gap-2 transition-opacity ${loadingProgress > 10 ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${loadingProgress > 10 ? 'bg-purple-500/20 text-purple-400' : 'bg-neutral-800 text-neutral-600'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6h.6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <span className="text-xs text-neutral-400">Cargando</span>
                </div>
                <div className={`flex flex-col items-center gap-2 transition-opacity ${loadingProgress > 40 ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${loadingProgress > 40 ? 'bg-purple-500/20 text-purple-400' : 'bg-neutral-800 text-neutral-600'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <span className="text-xs text-neutral-400">Analizando</span>
                </div>
                <div className={`flex flex-col items-center gap-2 transition-opacity ${loadingProgress > 70 ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${loadingProgress > 70 ? 'bg-purple-500/20 text-purple-400' : 'bg-neutral-800 text-neutral-600'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <span className="text-xs text-neutral-400">Finalizando</span>
                </div>
              </div>
            </div>
          </Card>
        </BackgroundGradient>
      </div>
    </div>
  );
}
