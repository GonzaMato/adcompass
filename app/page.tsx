import { Button } from "./components/Button";
import { Badge } from "./components/Badge";
import { Card } from "./components/Card";
import { ScrollReveal } from "./components/ScrollReveal";
import { Spotlight } from "./components/ui/Spotlight";
import { TypewriterEffect } from "./components/ui/TypewriterEffect";
import { Button as MovingBorderButton } from "./components/ui/MovingBorder";
import { BackgroundBeams } from "./components/ui/BackgroundBeams";
import { HoverEffect } from "./components/ui/CardHoverEffect";
import { BackgroundGradient } from "./components/ui/BackgroundGradient";

export default function Home() {
  const words = [
    {
      text: "The",
    },
    {
      text: "AI",
      className: "text-purple-400",
    },
    {
      text: "Creative",
      className: "text-blue-400",
    },
    {
      text: "Director",
      className: "text-pink-400",
    },
  ];

  const features = [
    {
      title: "Brand Alignment",
      description: "Color palette matching, logo usage verification, tone of voice consistency using CLIP Similarity and Delta-E Color analysis.",
      icon: "🎨",
    },
    {
      title: "Visual Quality",
      description: "Composition analysis, resolution check, artifact detection using OpenCV and Gemini Vision.",
      icon: "📸",
    },
    {
      title: "Message Clarity",
      description: "Product visibility scoring, tagline correctness, CTA strength with NLP Analysis and OCR.",
      icon: "💬",
    },
    {
      title: "Safety & Ethics",
      description: "Harmful content detection, stereotype identification, misleading claims prevention.",
      icon: "🛡️",
    },
  ];

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02]">
      {/* Hero Section with Spotlight */}
      <section className="h-screen w-full rounded-md flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <div className="p-4 max-w-7xl mx-auto relative z-10 w-full pt-20 md:pt-0">
          <div className="animate-fade-in text-center mb-8">
            <Badge variant="primary">
              🚀 Built for Hack-Nation&apos;s Global AI Hackathon 2025
            </Badge>
          </div>
          
          <TypewriterEffect words={words} className="text-center justify-center" />
          
          <h1 className="text-2xl md:text-4xl lg:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
            That Actually Works
          </h1>
          
          <p className="mt-8 font-normal text-base text-neutral-300 max-w-3xl text-center mx-auto">
            BrandAI evaluates AI-generated ads in <span className="font-bold text-purple-400">seconds</span>. Get instant critiques across 
            4 dimensions: Brand Alignment, Visual Quality, Message Clarity, and Safety.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-6 justify-center items-center">
            <MovingBorderButton
              borderRadius="1.75rem"
              className="bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                Try Live Demo
              </span>
            </MovingBorderButton>
            
            <button className="relative inline-flex h-16 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Star on GitHub
              </span>
            </button>
          </div>

          <div className="mt-12 text-neutral-400 text-sm text-center">
            <p className="flex items-center justify-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              From 8 hours/week review time → 15 seconds per ad
            </p>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-neutral-950">
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal animation="fade">
            <div className="text-center mb-16">
              <Badge variant="danger">The Problem</Badge>
              <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-white">
                Brands Don&apos;t Trust AI-Generated Ads
              </h2>
              <p className="mt-4 text-xl text-neutral-400 max-w-3xl mx-auto">
                Every day, millions of AI-generated ads are created. But only 5% are deployed without human review.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal animation="slide-up" delay={100}>
              <Card hover className="group cursor-pointer transform transition-all duration-300 hover:scale-105 bg-neutral-900 border-red-900/20">
                <div className="text-center">
                  <div className="text-5xl font-black text-red-400 group-hover:scale-110 transition-transform">{"<5%"}</div>
                  <div className="mt-4 text-xl font-semibold text-white">Deployment Rate</div>
                  <p className="mt-2 text-neutral-400">
                    AI ads deployed without human review
                  </p>
                </div>
              </Card>
            </ScrollReveal>

            <ScrollReveal animation="slide-up" delay={300}>
              <Card hover className="group cursor-pointer transform transition-all duration-300 hover:scale-105 bg-neutral-900 border-orange-900/20">
                <div className="text-center">
                  <div className="text-5xl font-black text-orange-400 group-hover:scale-110 transition-transform">40%</div>
                  <div className="mt-4 text-xl font-semibold text-white">Rejection Rate</div>
                  <p className="mt-2 text-neutral-400">
                    AI ads rejected for brand misalignment
                  </p>
                </div>
              </Card>
            </ScrollReveal>

            <ScrollReveal animation="slide-up" delay={500}>
              <Card hover className="group cursor-pointer transform transition-all duration-300 hover:scale-105 bg-neutral-900 border-purple-900/20">
                <div className="text-center">
                  <div className="text-5xl font-black text-purple-400 group-hover:scale-110 transition-transform">$50B+</div>
                  <div className="mt-4 text-xl font-semibold text-white">Wasted Annually</div>
                  <p className="mt-2 text-neutral-400">
                    On unusable AI-generated marketing content
                  </p>
                </div>
              </Card>
            </ScrollReveal>
          </div>

          <ScrollReveal animation="fade" delay={700}>
            <div className="mt-12 text-center">
              <p className="text-lg text-neutral-300 font-medium">
                Marketing teams spend <span className="text-purple-400 font-bold relative">
                  8-12 hours/week
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-purple-500/30 -z-10"></span>
                </span> manually reviewing AI-generated content
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
        <BackgroundBeams />

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal animation="scale">
            <div className="text-center mb-16">
              <Badge variant="success">The Solution</Badge>
              <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-white">
                4 Dimensions of AI Critique
              </h2>
              <p className="mt-4 text-xl text-neutral-400 max-w-3xl mx-auto">
                BrandAI evaluates every ad with the precision of a creative director and the speed of AI
              </p>
            </div>
          </ScrollReveal>

          <div className="max-w-5xl mx-auto px-8">
            <HoverEffect items={features} />
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
        {/* Simple gradient background without heavy animations */}
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal animation="fade">
            <div className="text-center mb-16">
              <Badge variant="primary">See It In Action</Badge>
              <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-white">
                From Critique to Perfection in <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">15 Seconds</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Before */}
            <ScrollReveal animation="slide-left" delay={200}>
              <BackgroundGradient>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white">Before</h3>
                    <Badge variant="danger">3.2/10</Badge>
                  </div>
                  <div className="bg-gradient-to-br from-red-900/40 to-orange-900/40 rounded-lg h-64 flex items-center justify-center border border-red-800/30">
                    <div className="text-center text-neutral-300">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="font-semibold">AI-Generated Ad (Raw)</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-red-400">❌</span>
                      <span className="text-neutral-300">Brand Alignment: <strong className="text-red-400">3/10</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-yellow-400">⚠️</span>
                      <span className="text-neutral-300">Visual Quality: <strong className="text-yellow-400">6/10</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-red-400">❌</span>
                      <span className="text-neutral-300">Message Clarity: <strong className="text-red-400">2/10</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-400">✓</span>
                      <span className="text-neutral-300">Safety: <strong className="text-green-400">9/10</strong></span>
                    </div>
                  </div>
                  <div className="bg-red-950/50 border border-red-800/50 rounded-lg p-3 text-sm text-red-300">
                    <p className="font-semibold mb-1">Issues Detected:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Logo color is #FF0000 but brand uses #E31837</li>
                      <li>Tone too aggressive for family brand</li>
                      <li>Missing mandatory tagline</li>
                    </ul>
                  </div>
                </div>
              </div>
              </BackgroundGradient>
            </ScrollReveal>

            {/* After */}
            <ScrollReveal animation="slide-right" delay={400}>
              <BackgroundGradient>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white">After</h3>
                    <Badge variant="success">9.1/10</Badge>
                  </div>
                  <div className="bg-gradient-to-br from-green-900/40 to-blue-900/40 rounded-lg h-64 flex items-center justify-center border border-green-800/30">
                    <div className="text-center text-neutral-300">
                      <svg className="w-16 h-16 mx-auto mb-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-semibold">Optimized Ad</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-400">✓</span>
                      <span className="text-neutral-300">Brand Alignment: <strong className="text-green-400">9/10</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-400">✓</span>
                      <span className="text-neutral-300">Visual Quality: <strong className="text-green-400">9/10</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-400">✓</span>
                      <span className="text-neutral-300">Message Clarity: <strong className="text-green-400">10/10</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-400">✓</span>
                      <span className="text-neutral-300">Safety: <strong className="text-green-400">9/10</strong></span>
                    </div>
                  </div>
                  <div className="bg-green-950/50 border border-green-800/50 rounded-lg p-3 text-sm text-green-300">
                    <p className="font-semibold mb-1">✨ Improvements Applied:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Corrected logo color to #E31837</li>
                      <li>Adjusted tone to match brand voice</li>
                      <li>Added brand tagline in correct position</li>
                    </ul>
                  </div>
                </div>
              </div>
              </BackgroundGradient>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-black bg-grid-white/[0.05]">
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal animation="fade">
            <div className="text-center mb-16">
              <Badge variant="primary">Powered By</Badge>
              <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-white">
                Cutting-Edge AI Technology
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <ScrollReveal animation="scale" delay={100}>
              <Card hover className="group cursor-pointer transform transition-all duration-300 hover:scale-110 bg-neutral-900 border-neutral-800">
                <div className="text-center">
                  <div className="text-4xl mb-3 group-hover:animate-bounce-slow">🤖</div>
                  <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">Gemini Vision</h3>
                  <p className="text-sm text-neutral-400 mt-1">Multi-modal AI</p>
                </div>
              </Card>
            </ScrollReveal>
            
            <ScrollReveal animation="scale" delay={200}>
              <Card hover className="group cursor-pointer transform transition-all duration-300 hover:scale-110 bg-neutral-900 border-neutral-800">
                <div className="text-center">
                  <div className="text-4xl mb-3 group-hover:animate-bounce-slow animation-delay-200">🎯</div>
                  <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">CLIP</h3>
                  <p className="text-sm text-neutral-400 mt-1">Visual Similarity</p>
                </div>
              </Card>
            </ScrollReveal>
            
            <ScrollReveal animation="scale" delay={300}>
              <Card hover className="group cursor-pointer transform transition-all duration-300 hover:scale-110 bg-neutral-900 border-neutral-800">
                <div className="text-center">
                  <div className="text-4xl mb-3 group-hover:animate-bounce-slow animation-delay-400">⚡</div>
                  <h3 className="font-bold text-white group-hover:text-yellow-400 transition-colors">Next.js 14</h3>
                  <p className="text-sm text-neutral-400 mt-1">React Framework</p>
                </div>
              </Card>
            </ScrollReveal>
            
            <ScrollReveal animation="scale" delay={400}>
              <Card hover className="group cursor-pointer transform transition-all duration-300 hover:scale-110 bg-neutral-900 border-neutral-800">
                <div className="text-center">
                  <div className="text-4xl mb-3 group-hover:animate-bounce-slow animation-delay-600">🎨</div>
                  <h3 className="font-bold text-white group-hover:text-pink-400 transition-colors">OpenCV</h3>
                  <p className="text-sm text-neutral-400 mt-1">Image Processing</p>
                </div>
              </Card>
            </ScrollReveal>
          </div>

          <ScrollReveal animation="fade" delay={600}>
            <div className="mt-12 text-center">
              <p className="text-neutral-400">
                Built with <span className="font-semibold text-purple-400">Python FastAPI</span>, <span className="font-semibold text-blue-400">LangChain</span>, and deployed on <span className="font-semibold text-orange-400">Google Cloud Platform</span>
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-blue-500/20 animate-gradient"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScrollReveal animation="scale">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Trust AI with Your Ads?
            </h2>
          </ScrollReveal>
          
          <ScrollReveal animation="fade" delay={200}>
            <p className="text-xl text-purple-100 mb-8">
              Join the future of autonomous advertising. Save <span className="font-bold text-white">8 hours/week</span> and deploy ads with confidence.
            </p>
          </ScrollReveal>
          
          <ScrollReveal animation="slide-up" delay={400}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="group">
                <span className="group-hover:scale-110 inline-block transition-transform">🚀</span>
                Request Demo
              </Button>
              <Button size="lg" variant="outline" className="group">
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Star on GitHub
              </Button>
            </div>
          </ScrollReveal>
          
          <ScrollReveal animation="fade" delay={600}>
            <p className="mt-8 text-purple-200 text-sm flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Built for Hack-Nation&apos;s Global AI Hackathon 2025 • MIT Sloan AI Club
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-400 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20"></div>
        <ScrollReveal animation="fade">
          <p className="relative z-10">
            © 2025 BrandAI. Built with <span className="text-red-500 animate-pulse">❤️</span> in <span className="font-semibold text-white">24 hours</span>.
          </p>
        </ScrollReveal>
      </footer>
    </div>
  );
}
