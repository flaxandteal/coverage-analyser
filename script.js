/**
 * 24/7 Support Coverage Analyzer
 * Interactive timezone coverage calculator for global support teams
 */

// Timezone offset mappings (hours from UTC)
const timezoneOffsets = {
    'AEST': 10,     // Australian Eastern Standard Time
    'AEDT': 11,     // Australian Eastern Daylight Time
    'NZST': 12,     // New Zealand Standard Time
    'NZDT': 13,     // New Zealand Daylight Time
    'JST': 9,       // Japan Standard Time
    'KST': 9,       // Korea Standard Time
    'CST_CHINA': 8, // China Standard Time
    'IST': 5.5,     // India Standard Time
    'GST': 4,       // Gulf Standard Time
    'MSK': 3,       // Moscow Standard Time
    'EET': 2,       // Eastern European Time
    'CET': 1,       // Central European Time
    'GMT': 0,       // Greenwich Mean Time
    'UTC': 0,       // Coordinated Universal Time
    'WET': 0,       // Western European Time
    'AST': -4,      // Atlantic Standard Time
    'EST': -5,      // Eastern Standard Time
    'CST': -6,      // Central Standard Time
    'MST': -7,      // Mountain Standard Time
    'PST': -8,      // Pacific Standard Time
    'AKST': -9,     // Alaska Standard Time
    'HST': -10,     // Hawaii Standard Time
    'BRT': -3,      // Brazil Time
    'ART': -3,      // Argentina Time
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

/**
 * Get timezone offset in hours from UTC
 * @param {string} timezone - Timezone code
 * @returns {number} Offset in hours
 */
function getTimezoneOffset(timezone) {
    if (timezoneOffsets.hasOwnProperty(timezone)) {
        return timezoneOffsets[timezone];
    }
    throw new Error(`Unknown timezone: ${timezone}`);
}

/**
 * Create a team row HTML element
 * @param {Object} team - Team configuration object
 * @param {number} index - Team index
 * @returns {string} HTML string
 */
function createTeamRow(team, index) {
    return `
        <div class="team-row" data-index="${index}">
            <div class="form-group">
                <div class="form-label">Region</div>
                <input type="text" class="form-input" value="${team.region}" 
                       onchange="updateTeam(${index}, 'region', this.value)" 
                       placeholder="Enter region name">
            </div>
            <div class="form-group">
                <div class="form-label">Timezone</div>
                <select class="form-select" onchange="updateTeam(${index}, 'timezone', this.value)">
                    ${Object.keys(timezoneOffsets).map(tz => 
                        `<option value="${tz}" ${tz === team.timezone ? 'selected' : ''}>${tz}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <div class="form-label">Start Time</div>
                <input type="number" class="form-input time-input" min="0" max="23" 
                       value="${team.local_working_hours[0]}" 
                       onchange="updateWorkingHours(${index}, 0, this.value)">
            </div>
            <div class="form-group">
                <div class="form-label">End Time</div>
                <input type="number" class="form-input time-input" min="1" max="24" 
                       value="${team.local_working_hours[1]}" 
                       onchange="updateWorkingHours(${index}, 1, this.value)">
            </div>
            <div class="form-group">
                <div class="form-label">Staff</div>
                <input type="number" class="form-input staff-input" min="1" 
                       value="${team.number_of_staff}" 
                       onchange="updateTeam(${index}, 'number_of_staff', parseInt(this.value))">
            </div>
            <div class="form-group">
                <div class="form-label">&nbsp;</div>
                <button class="delete-btn" onclick="removeTeam(${index})" 
                        title="Remove team" aria-label="Remove team">×</button>
            </div>
        </div>
    `;
}

/**
 * Render the entire team form
 */
function renderTeamForm() {
    const formContainer = document.getElementById('teamForm');
    formContainer.innerHTML = teams.map((team, index) => createTeamRow(team, index)).join('');
    updateChart();
}

/**
 * Add a new team row
 */
function addTeamRow() {
    teams.push({
        region: "New Region",
        timezone: "GMT",
        local_working_hours: [9, 17],
        number_of_staff: 1
    });
    renderTeamForm();
}

/**
 * Remove a team by index
 * @param {number} index - Team index to remove
 */
function removeTeam(index) {
    if (teams.length > 1) {
        teams.splice(index, 1);
        renderTeamForm();
    } else {
        alert("You must have at least one team!");
    }
}

/**
 * Update a team field
 * @param {number} index - Team index
 * @param {string} field - Field name to update
 * @param {*} value - New value
 */
function updateTeam(index, field, value) {
    teams[index][field] = value;
    updateChart();
}

/**
 * Update working hours for a team
 * @param {number} index - Team index
 * @param {number} hourIndex - 0 for start, 1 for end
 * @param {string} value - Hour value
 */
function updateWorkingHours(index, hourIndex, value) {
    const hour = parseInt(value);
    if (hour >= 0 && hour <= 24) {
        teams[index].local_working_hours[hourIndex] = hour;
        updateChart();
    }
}

/**
 * Calculate UTC coverage for all teams
 * @param {Array} teams - Array of team objects
 * @returns {Array} 24-element array with staff count per UTC hour
 */
function calculateUTCCoverage(teams) {
    const coverage = new Array(24).fill(0);
    
    teams.forEach(team => {
        try {
            const offset = getTimezoneOffset(team.timezone);
            const [startLocal, endLocal] = team.local_working_hours;
            
            // Convert local hours to UTC
            let startUTC = startLocal - offset;
            let endUTC = endLocal - offset;
            
            // Handle day wrapping
            if (startUTC < 0) startUTC += 24;
            if (endUTC <= 0) endUTC += 24;
            if (startUTC >= 24) startUTC -= 24;
            if (endUTC > 24) endUTC -= 24;
            
            const wrapsDay = endUTC < startUTC;
            
            if (wrapsDay) {
                // Coverage spans midnight UTC
                for (let hour = Math.floor(startUTC); hour < 24; hour++) {
                    coverage[hour] += team.number_of_staff;
                }
                for (let hour = 0; hour < Math.floor(endUTC); hour++) {
                    coverage[hour] += team.number_of_staff;
                }
            } else {
                // Normal case - coverage within same day
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

/**
 * Generate timezone row HTML
 * @param {Object} team - Team object
 * @returns {string} HTML string
 */
function generateTimezoneRow(team) {
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
        
        let hoursHtml = '';
        for (let hour = 0; hour < 24; hour++) {
            let isWorking = false;
            
            if (wrapsDay) {
                isWorking = hour >= Math.floor(startUTC) || hour < Math.floor(endUTC);
            } else {
                isWorking = hour >= Math.floor(startUTC) && hour < Math.floor(endUTC);
            }
            
            const blockClass = isWorking ? 'working' : 'off';
            const staffCount = isWorking ? team.number_of_staff : 0;
            hoursHtml += `<div class="hour-block ${blockClass}" title="${hour}:00 UTC">${staffCount}</div>`;
        }
        
        const localHoursText = `${startLocal}:00-${endLocal}:00 local`;
        
        return `
            <div class="timezone-row">
                <div class="timezone-label">
                    ${team.region} <span class="staff-count">${team.number_of_staff}</span>
                    <br><span class="local-hours">${localHoursText}</span>
                </div>
                <div class="coverage-bar">
                    ${hoursHtml}
                </div>
            </div>
        `;
    } catch (error) {
        return `
            <div class="timezone-row">
                <div class="timezone-label" style="color: #e74c3c;">
                    ${team.region} <span style="background: #e74c3c;">ERROR</span>
                </div>
                <div class="coverage-bar">
                    ${Array(24).fill('<div class="hour-block off">0</div>').join('')}
                </div>
            </div>
        `;
    }
}

/**
 * Generate summary row HTML
 * @param {Array} coverage - Coverage array
 * @returns {string} HTML string
 */
function generateSummaryRow(coverage) {
    let summaryHtml = '';
    for (let hour = 0; hour < 24; hour++) {
        const count = coverage[hour];
        let blockClass = 'coverage-good';
        if (count === 0) blockClass = 'coverage-critical';
        else if (count === 1) blockClass = 'coverage-warning';
        
        summaryHtml += `<div class="hour-block ${blockClass}" title="${hour}:00 UTC: ${count} people">${count}</div>`;
    }
    return summaryHtml;
}

/**
 * Analyze coverage gaps and warnings
 * @param {Array} coverage - Coverage array
 * @returns {Object} Object with gaps and warnings arrays
 */
function analyzeGaps(coverage) {
    const gaps = [];
    const warnings = [];
    
    for (let hour = 0; hour < 24; hour++) {
        if (coverage[hour] === 0) {
            gaps.push(hour);
        } else if (coverage[hour] === 1) {
            warnings.push(hour);
        }
    }
    
    return { gaps, warnings };
}

/**
 * Format hour arrays into readable ranges
 * @param {Array} hours - Array of hour numbers
 * @returns {string} Formatted string
 */
function formatHourRanges(hours) {
    if (hours.length === 0) return 'None';
    
    const ranges = [];
    let start = hours[0];
    let end = start;
    
    for (let i = 1; i < hours.length; i++) {
        if (hours[i] === end + 1) {
            end = hours[i];
        } else {
            if (start === end) {
                ranges.push(`${start.toString().padStart(2, '0')}:00`);
            } else {
                ranges.push(`${start.toString().padStart(2, '0')}:00-${(end + 1).toString().padStart(2, '0')}:00`);
            }
            start = hours[i];
            end = start;
        }
    }
    
    // Add the last range
    if (start === end) {
        ranges.push(`${start.toString().padStart(2, '0')}:00`);
    } else {
        ranges.push(`${start.toString().padStart(2, '0')}:00-${(end + 1).toString().padStart(2, '0')}:00`);
    }
    
    return ranges.join(', ');
}

/**
 * Update the chart visualization
 */
function updateChart() {
    const errorDisplay = document.getElementById('error-display');
    const chartContainer = document.getElementById('chart-container');
    
    try {
        errorDisplay.innerHTML = '';
        
        // Validate teams
        for (let i = 0; i < teams.length; i++) {
            const team = teams[i];
            if (!team.region || !team.timezone || !team.local_working_hours || team.number_of_staff === undefined) {
                throw new Error(`Team ${i + 1}: Missing required fields`);
            }
            if (team.local_working_hours[0] >= team.local_working_hours[1]) {
                throw new Error(`Team ${i + 1}: End time must be after start time`);
            }
        }
        
        const coverage = calculateUTCCoverage(teams);
        const { gaps, warnings } = analyzeGaps(coverage);
        
        // Generate header
        const headerHtml = `
            <div class="timeline-header">
                <div style="width: 140px; font-size: 16px;">Current Teams</div>
                ${Array.from({length: 24}, (_, i) => 
                    `<div class="hour-label">${i.toString().padStart(2, '0')}</div>`
                ).join('')}
            </div>
        `;
        
        // Generate team rows
        const teamRowsHtml = teams.map(team => generateTimezoneRow(team)).join('');
        
        // Generate summary
        const summaryHtml = `
            <div class="summary-row">
                <div style="font-weight: bold; color: #2c3e50; margin-bottom: 10px;">
                    TOTAL COVERAGE (Current)
                </div>
                <div class="summary-bar">
                    ${generateSummaryRow(coverage)}
                </div>
            </div>
        `;
        
        // Generate analysis
        const totalStaff = teams.reduce((sum, team) => sum + team.number_of_staff, 0);
        const analysisHtml = `
            <div class="solution-section">
                <div class="solution-title">📊 Coverage Analysis</div>
                
                <div class="gap-analysis">
                    <div style="font-weight: bold; color: #2c3e50; margin-bottom: 15px;">
                        Coverage Summary:
                    </div>
                    <div><strong>Critical Gaps (0 people):</strong> ${formatHourRanges(gaps)} UTC</div>
                    <div><strong>Warning Areas (1 person):</strong> ${formatHourRanges(warnings)} UTC</div>
                    <div><strong>Total Staff:</strong> ${totalStaff} people</div>
                    <div><strong>Timezone Coverage:</strong> ${teams.length} regions</div>
                    <div><strong>Average Coverage:</strong> ${(coverage.reduce((a, b) => a + b, 0) / 24).toFixed(1)} people/hour</div>
                </div>
                
                ${gaps.length > 0 || warnings.length > 0 ? `
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ffc107;">
                    <strong>🚨 Recommendations:</strong><br>
                    ${gaps.length > 0 ? `• <strong>Critical:</strong> Add coverage for ${formatHourRanges(gaps)} UTC<br>` : ''}
                    ${warnings.length > 0 ? `• <strong>Consider:</strong> Additional staff for ${formatHourRanges(warnings)} UTC to ensure redundancy` : ''}
                </div>
                ` : `
                <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #27ae60;">
                    <strong>✅ Excellent Coverage:</strong> 2+ people available 24/7 with full redundancy!
                </div>
                `}
            </div>
        `;
        
        const legendHtml = `
            <div class="legend">
                <div class="legend-item">
                    <div class="legend-color coverage-good"></div>
                    <span>2+ People Available (Good)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color coverage-warning"></div>
                    <span>Only 1 Person (Warning)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color coverage-critical"></div>
                    <span>No Coverage (Critical)</span>
                </div>
            </div>
        `;
        
        chartContainer.innerHTML = `
            <div class="timeline">
                ${headerHtml}
                ${teamRowsHtml}
                ${summaryHtml}
            </div>
            ${legendHtml}
            ${analysisHtml}
        `;
        
    } catch (error) {
        errorDisplay.innerHTML = `<div class="error"><strong>Error:</strong> ${error.message}</div>`;
        console.error('Chart update error:', error);
    }
}

// Initialize form and chart on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('24/7 Coverage Analyzer initialized');
    renderTeamForm();
});

// Export functions for testing (if running in Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        timezoneOffsets,
        calculateUTCCoverage,
        analyzeGaps,
        formatHourRanges
    };
}