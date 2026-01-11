import { Heart, Lock, Share2, TrendingUp, Shield, Clock } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-green-50">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">HealthVault</span>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-100/50 rounded-full border border-blue-200">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span className="text-sm font-medium text-blue-700">Smart Health Management</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Health Records,
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Always in Control</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                HealthVault is your personal digital health wallet. Securely store, track, and share your medical records with healthcare providers. Take control of your health journey today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all duration-300 text-lg"
                >
                  Start Free
                </button>
                <button className="px-8 py-4 border-2 border-gray-300 text-gray-900 rounded-lg font-semibold hover:border-gray-400 transition-all duration-300">
                  Learn More
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-green-600/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200/50">
                    <Heart className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Heart Rate</p>
                      <p className="text-2xl font-bold text-gray-900">72 bpm</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200/50">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Blood Pressure</p>
                      <p className="text-2xl font-bold text-gray-900">120/80 mmHg</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200/50">
                    <Activity className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Activity</p>
                      <p className="text-2xl font-bold text-gray-900">8,243 steps</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Health
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed for your wellbeing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: 'Bank-Level Security',
                description: 'Your health data is encrypted and protected with enterprise-grade security measures.',
              },
              {
                icon: Share2,
                title: 'Easy Sharing',
                description: 'Share medical records with doctors and healthcare providers instantly with full control.',
              },
              {
                icon: TrendingUp,
                title: 'Health Insights',
                description: 'Track trends and get insights into your health patterns over time.',
              },
              {
                icon: Shield,
                title: 'Privacy First',
                description: 'Your data is yours. We never sell or share your information without permission.',
              },
              {
                icon: Clock,
                title: 'Always Available',
                description: 'Access your records anytime, anywhere from any device.',
              },
              {
                icon: Heart,
                title: 'Holistic Care',
                description: 'Track vitals, medications, appointments, and everything health-related in one place.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl border border-gray-200 bg-white hover:shadow-lg transition-all duration-300 hover:border-blue-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: '1',
                title: 'Create Account',
                description: 'Sign up with your email and create a secure account in seconds.',
              },
              {
                number: '2',
                title: 'Add Your Records',
                description: 'Upload or manually enter your medical records and health data.',
              },
              {
                number: '3',
                title: 'Share & Track',
                description: 'Share with healthcare providers and track your health progress.',
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 right-0 w-1/3 h-1 bg-gradient-to-r from-blue-600/50 to-transparent translate-x-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Take Control of Your Health Today
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users managing their health with HealthVault. Start free, no credit card required.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 text-lg"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">HealthVault</span>
              </div>
              <p className="text-sm">Your personal digital health wallet for secure health management.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">© 2026 HealthVault. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-sm hover:text-white transition">Twitter</a>
              <a href="#" className="text-sm hover:text-white transition">LinkedIn</a>
              <a href="#" className="text-sm hover:text-white transition">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Activity() {
  return <TrendingUp />;
}
