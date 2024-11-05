import { coefficients } from '../constants/riskCalculatorConstants';

export const getAgeGroup = (age) => {
    if (!age) return "45_to_64"; // default to reference category
    const ageNum = parseInt(age);
    if (ageNum < 45) return "under_45";
    if (ageNum >= 80) return "80_plus";
    if (ageNum >= 65) return "65_to_79";
    return "45_to_64";
};

export const getBreakLocation = (selectedHours) => {
    if (selectedHours.length === 0) return "no_break";

    const has4or8 = selectedHours.includes(4) || selectedHours.includes(8);
    const has5to7 = selectedHours.includes(5) || selectedHours.includes(6) || selectedHours.includes(7);

    if (has5to7) return "5_to_7";  // 5-7 takes precedence
    if (has4or8) return "4_or_8";
    return "9_to_3";  // reference category
};

export const getInferiorDetachment = (detachmentSegments) => {
    const affectedHours = Array.from(new Set(detachmentSegments.map(seg =>
        Math.floor(seg / 5) + 1
    )));

    const has6 = affectedHours.includes(6);
    const has3to5 = [3, 4, 5].some(h => affectedHours.includes(h));

    if (has6) return "6_hours";
    if (has3to5) return "3_to_5";
    return "less_than_3";  // reference category
};

export const isTotalRD = (detachmentSegments) => {
    const affectedHours = Array.from(new Set(detachmentSegments.map(seg =>
        Math.floor(seg / 5) + 1
    )));
    return affectedHours.length >= 10 ? "yes" : "no";
};

export const getPVRGrade = (pvrGrade) => {
    return pvrGrade === 'C' ? "C" : "none_A_B";
};

export const calculateRiskWithSteps = ({
    age,
    pvrGrade,
    vitrectomyGauge,
    selectedHours,
    detachmentSegments
}) => {
    const steps = [];
    let logit = coefficients.constant;
    steps.push({
        label: "Constant",
        value: coefficients.constant.toFixed(3)
    });

    // Age coefficient
    const ageGroup = getAgeGroup(age);
    const ageCoef = coefficients.age_group[ageGroup];
    logit += ageCoef;
    steps.push({
        label: "Age group",
        value: ageCoef.toFixed(3),
        detail: `(${ageGroup.replace(/_/g, ' ')})`
    });

    // Break location coefficient
    const breakLoc = getBreakLocation(selectedHours);
    const breakCoef = coefficients.break_location[breakLoc];
    logit += breakCoef;
    steps.push({
        label: "Break location",
        value: breakCoef.toFixed(3),
        detail: `(${breakLoc.replace(/_/g, ' ')} o'clock)`
    });

    // RD location coefficients
    const totalRD = isTotalRD(detachmentSegments);
    if (totalRD === "yes") {
        const rdCoef = coefficients.total_rd.yes;
        logit += rdCoef;
        steps.push({
            label: "Total RD",
            value: rdCoef.toFixed(3)
        });
    } else {
        const infDet = getInferiorDetachment(detachmentSegments);
        const infDetCoef = coefficients.inferior_detachment[infDet];
        logit += infDetCoef;
        steps.push({
            label: "Inferior detachment",
            value: infDetCoef.toFixed(3),
            detail: `(${infDet.replace(/_/g, ' ')} o'clock)`
        });
    }

    // PVR grade coefficient
    const pvrType = getPVRGrade(pvrGrade);
    const pvrCoef = coefficients.pvr_grade[pvrType];
    logit += pvrCoef;
    steps.push({
        label: "PVR grade",
        value: pvrCoef.toFixed(3),
        detail: `(grade ${pvrType === "C" ? "C" : "A/B"})`
    });

    // Vitrectomy gauge coefficient
    const gaugeCoef = coefficients.gauge[vitrectomyGauge.toLowerCase()];
    logit += gaugeCoef;
    steps.push({
        label: "Vitrectomy gauge",
        value: gaugeCoef.toFixed(3),
        detail: `(${vitrectomyGauge}, odds ratio ${Math.exp(gaugeCoef).toFixed(3)})`
    });

    // Final calculations
    const probability = 1 / (1 + Math.exp(-logit));

    return {
        steps,
        logit: logit.toFixed(3),
        probability: (probability * 100).toFixed(1)
    };
};
