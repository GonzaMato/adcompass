"use client";

import { Card } from "@/app/components/Card";
import { BackgroundGradient } from "@/app/components/ui/BackgroundGradient";

export default function LoadingScreen() {
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
                </div>
              </div>

              {/* Título y descripción */}
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-white">
                  Evaluating your asset...
                </h2>
                <p className="text-neutral-400 text-lg">
                  Our system is analyzing the content according to brand rules
                </p>
              </div>

              <p className="text-sm text-neutral-500">
                This may take a few moments...
              </p>
            </div>
          </Card>
        </BackgroundGradient>
      </div>
    </div>
  );
}
