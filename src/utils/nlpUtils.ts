export interface ParsedTask {
    title: string;
    date?: string;
    time?: string;
    priority?: 'high' | 'medium' | 'low';
    category?: 'work' | 'study' | 'life' | 'other';
}

export const parseTaskTitle = (input: string): ParsedTask => {
    let title = input;
    const result: ParsedTask = { title };

    // 1. Parse Priority (e.g., !high, !medium, !low or !1, !2, !3)
    const priorityMap: Record<string, 'high' | 'medium' | 'low'> = {
        '!high': 'high',
        '!medium': 'medium',
        '!low': 'low',
        '!1': 'high',
        '!2': 'medium',
        '!3': 'low',
    };

    for (const [key, value] of Object.entries(priorityMap)) {
        if (title.includes(key)) {
            result.priority = value;
            title = title.replace(key, '').trim();
        }
    }

    // 2. Parse Category (e.g., #work, #study, #life, #other)
    const categoryMap: Record<string, 'work' | 'study' | 'life' | 'other'> = {
        '#work': 'work',
        '#study': 'study',
        '#life': 'life',
        '#other': 'other',
    };

    for (const [key, value] of Object.entries(categoryMap)) {
        if (title.includes(key)) {
            result.category = value;
            title = title.replace(key, '').trim();
        }
    }

    // 3. Parse Time (e.g., @14:30, @9pm, @08:00)
    const timeRegex = /@(\d{1,2}(?::\d{2})?(?:\s?[ap]m)?)/i;
    const timeMatch = title.match(timeRegex);
    if (timeMatch) {
        let timeStr = timeMatch[1].toLowerCase();

        // Convert to HH:mm format
        if (timeStr.includes('pm') || timeStr.includes('am')) {
            const isPm = timeStr.includes('pm');
            const timeParts = timeStr.replace(/[ap]m/, '').trim().split(':');
            let hours = parseInt(timeParts[0]);
            const minutes = timeParts[1] || '00';

            if (isPm && hours < 12) hours += 12;
            if (!isPm && hours === 12) hours = 0;

            result.time = `${hours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        } else if (timeStr.includes(':')) {
            const [h, m] = timeStr.split(':');
            result.time = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
        } else {
            result.time = `${timeStr.padStart(2, '0')}:00`;
        }

        title = title.replace(timeMatch[0], '').trim();
    }

    // 4. Parse Date (e.g., ^today, ^tomorrow, ^2025-01-01)
    const dateRegex = /\^(\w+|(?:20\d{2}-\d{2}-\d{2}))/i;
    const dateMatch = title.match(dateRegex);
    if (dateMatch) {
        const val = dateMatch[1].toLowerCase();
        const today = new Date();

        if (val === 'today') {
            result.date = today.toISOString().split('T')[0];
        } else if (val === 'tomorrow') {
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            result.date = tomorrow.toISOString().split('T')[0];
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
            result.date = val;
        }

        title = title.replace(dateMatch[0], '').trim();
    }

    result.title = title;
    return result;
};
