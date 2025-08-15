/**
 * 24/7 Support Coverage Analyzer
 * Interactive timezone coverage calculator for global support teams
 */

// Timezone offset mappings (hours from UTC)
const timezoneOffsets = {
    'AEST': 10, 'AEDT': 11, 'NZST': 12, 'NZDT': 13,
    'JST': 9, 'KST': 9, 'CST_CHINA': 8, 'IST': 5.5,
    'GST': 4, 'MSK': 3, 'EET': 2, 'CET': 1,
    'GMT': 0, 'UTC': 0, 'WET': 0, 'AST': -4,
    'EST': -5, 'CST': -6, 'MST': -7, 'PST': -8,
    'AKST': -9, 'HST': -10, 'BRT': -3, 'ART': -3
};

// Default team configuration
let teams = [
    { region: "Queensland", timezone: "AEST", local_working_hours: [9, 17], number_of_staff: 1 },
    { region: "New Zealand", timezone: "NZST", local_working_hours: [9, 17], number_of_staff: 1 },
    { region: "India", timezone: "IST", local_working_hours: [12, 20], number_of_staff: 5 },
    { region: "UK", timezone: "GMT", local_working_hours: [9, 17], number_of_staff: 5 },
    { region: "Spain", timezone: "CET", local_working_hours: [9, 17], number_of_staff: 1 },
    { region: "Bulgaria", timezone: "EET", local_working_hours: [10, 18], number_of_staff: 3 },
    { region: "US East", timezone: "EST", local_working_hours: [7, 15], number_of_staff: 1 }
];

function getTimezoneOffset(timezone) {
    if (timezoneOffsets.hasOwnProperty(timezone)) {
        return timezoneOffsets[timezone];
    }
    throw new Error(`Unknown timezone: ${timezone}`);
}

function calculateUTCCoverage(teams) {
    const coverage = new Array(24).fill(0);
    
    teams.forEach(team => {
        try {
            const offset = getTimezoneOffset(team.timezone);
            const [startLocal, endLocal] = team.local_working_hours;
            
            let startUTC = startLocal - offset;
            let endUTC = endLocal - offset;
            
            if (startUTC < 0) startUTC += 24;
            if (endUTC <= 0) endUTC += 24;
            if (startUTC >= 24) startUTC -= 24;
            if (endUTC > 24) endUTC -= 24;
            
            const wrapsDay = endUTC < startUTC;
            
            if (wrapsDay) {
                for (let hour = Math.floor(startUTC); hour < 24; hour++) {
                    coverage[hour] += team.number_of_staff;
                }
                for (let hour = 0; hour < Math.floor(endUTC); hour++) {
                    coverage[hour] += team.number_of_staff;
                }
            } else {
                for (let hour = Math.floor(startUTC); hour < Math.floor(endUTC); hour++) {
                    coverage[hour] += team.number_of_staff;
                }
            }
        } catch (error) {
            console.warn(`Error processing team ${team.region}:`, error.message);
        }
    });
    
    return coverage;
}

// Additional functions for form management, chart generation, etc.
// (Full implementation would be included in the actual file)

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('24/7 Coverage Analyzer initialized');
    renderTeamForm();
});
