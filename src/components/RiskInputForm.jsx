import React from 'react';
import { pvrOptions, gaugeOptions } from '../constants/riskCalculatorConstants';

const RiskInputForm = ({ 
    position,
    age,
    setAge,
    pvrGrade,
    setPvrGrade,
    vitrectomyGauge,
    setVitrectomyGauge
}) => {
    if (position === "left") {
        return (
            <div className="space-y-4">
                {/* Age input */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Age (years)
                    </label>
                    <input
                        type="number"
                        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            ${!age ? 'bg-red-50 border-red-300' : 'border-gray-300'}`}
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        min="0"
                        max="120"
                        placeholder="Enter age"
                        required
                    />
                    {!age && (
                        <p className="text-sm text-red-600">Age is required</p>
                    )}
                </div>

                {/* PVR Grade radio group */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">PVR Grade</label>
                    <div className="space-y-2">
                        {pvrOptions.map((option) => (
                            <label key={option.value} className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="pvr"
                                    value={option.value}
                                    checked={pvrGrade === option.value}
                                    onChange={(e) => setPvrGrade(e.target.value)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{option.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (position === "right") {
        return (
            <div className="space-y-4">
                {/* Vitrectomy Gauge radio group */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Vitrectomy Gauge</label>
                    <div className="space-y-2">
                        {gaugeOptions.map((option) => (
                            <label key={option.value} className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="gauge"
                                    value={option.value}
                                    checked={vitrectomyGauge === option.value}
                                    onChange={(e) => setVitrectomyGauge(e.target.value)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{option.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default RiskInputForm;
