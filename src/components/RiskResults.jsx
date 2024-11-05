import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const RiskResults = ({ risk, showMath, setShowMath }) => {
    return (
        <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-semibold">
                    Estimated Risk of Failure: {risk.probability}%
                </p>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <button
                    onClick={() => setShowMath(!showMath)}
                    className="w-full p-4 text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                >
                    <span className="font-medium">Show calculation steps</span>
                    {showMath ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {showMath && (
                    <div className="p-4 bg-white border-t">
                        <div className="space-y-2">
                            {risk.steps.map((step, index) => (
                                <div key={index} className="flex items-baseline">
                                    <span className="w-1/3 text-sm text-gray-600">{step.label}:</span>
                                    <span className="w-20 font-mono">{step.value}</span>
                                    {step.detail && (
                                        <span className="text-sm text-gray-500 ml-2">{step.detail}</span>
                                    )}
                                </div>
                            ))}
                            <div className="mt-4 pt-4 border-t">
                                <div className="flex items-baseline">
                                    <span className="w-1/3 text-sm font-medium text-gray-600">Total logit:</span>
                                    <span className="w-20 font-mono font-medium">{risk.logit}</span>
                                </div>
                                <div className="mt-2 text-sm text-gray-600">
                                    Probability = 1 / (1 + e<sup>-logit</sup>) × 100%
                                </div>
                                <div className="mt-1 text-sm text-gray-600">
                                    = 1 / (1 + e<sup>{-risk.logit}</sup>) × 100%
                                </div>
                                <div className="mt-1 text-sm font-medium text-gray-900">
                                    = {risk.probability}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RiskResults;
