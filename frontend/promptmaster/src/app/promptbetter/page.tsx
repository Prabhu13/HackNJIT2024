// app/prompt-engineering/page.tsx
import { Metadata } from 'next';
import {
  BookOpen,
  Brain,
  Code2,
  Coins,
  Lock,
  MessageSquare,
  Settings2,
  Sparkles,
  Target,
  Workflow,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Prompt Engineering Dashboard',
  description: 'Learn about the importance and best practices of prompt engineering',
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  trend?: 'up' | 'down';
}

function MetricCard({ title, value, description, trend }: MetricCardProps) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {trend && (
          <span className={`ml-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </div>
  );
}

export default function PromptEngineeringDashboard() {
  const features = [
    {
      title: 'Context Optimization',
      description: 'Learn to craft prompts that provide clear context and constraints for better AI responses.',
      icon: <Brain className="h-6 w-6 text-blue-600" />,
    },
    {
      title: 'Cost Efficiency',
      description: 'Reduce token usage and API costs through efficient prompt design and optimization.',
      icon: <Coins className="h-6 w-6 text-blue-600" />,
    },
    {
      title: 'Output Quality',
      description: 'Improve the quality and relevance of AI-generated content through structured prompting.',
      icon: <Sparkles className="h-6 w-6 text-blue-600" />,
    },
    {
      title: 'Security & Safety',
      description: 'Implement best practices for secure and responsible prompt engineering.',
      icon: <Lock className="h-6 w-6 text-blue-600" />,
    },
    {
      title: 'Workflow Integration',
      description: 'Seamlessly integrate prompt engineering into existing development workflows.',
      icon: <Workflow className="h-6 w-6 text-blue-600" />,
    },
    {
      title: 'Performance Metrics',
      description: 'Track and optimize prompt performance using key metrics and analytics.',
      icon: <Target className="h-6 w-6 text-blue-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Prompt Engineering Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">
            Master the art of crafting effective prompts for AI language models
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Response Quality"
            value="92%"
            description="Average response relevance score"
            trend="up"
          />
          <MetricCard
            title="Token Efficiency"
            value="35%"
            description="Reduction in token usage"
            trend="up"
          />
          <MetricCard
            title="Cost Savings"
            value="$2.5k"
            description="Monthly API cost reduction"
            trend="up"
          />
          <MetricCard
            title="Time Saved"
            value="12hrs"
            description="Average time saved per week"
            trend="up"
          />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </div>

        {/* Best Practices Section */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Best Practices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex space-x-4">
              <BookOpen className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Clear Instructions</h3>
                <p className="mt-1 text-gray-600">Provide specific, unambiguous instructions in your prompts</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <MessageSquare className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Context Setting</h3>
                <p className="mt-1 text-gray-600">Establish clear context and desired outcome expectations</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Settings2 className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium  text-gray-900">Parameter Tuning</h3>
                <p className="mt-1 text-gray-600">Optimize temperature and other model parameters</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Code2 className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Structured Output</h3>
                <p className="mt-1 text-gray-600">Define expected output format and structure</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}