const algorithms = [
    { name: 'Bubble Sort', func: bubbleSort },
    { name: 'Quick Sort', func: quickSort },
    { name: 'Merge Sort', func: mergeSort },
    { name: 'Insertion Sort', func: insertionSort },
    { name: 'Selection Sort', func: selectionSort },
    { name: 'Heap Sort', func: heapSort }
];

let masterArray = [];
const speedControl = document.getElementById('speed');
const algorithmsGrid = document.getElementById('algorithmsGrid');

function initialize() {
    algorithmsGrid.innerHTML = '';
    algorithms.forEach(algo => {
        const container = document.createElement('div');
        container.className = 'algorithm-container';
        container.innerHTML = `
            <h3 class="algorithm-title">${algo.name}</h3>
            <div class="visualization" id="${algo.name}-viz"></div>
            <div class="timer" id="${algo.name}-time">Time: 0ms</div>
        `;
        algorithmsGrid.appendChild(container);
    });
    generateNewArray();
}

function generateNewArray() {
    masterArray = Array.from({ length: 25 }, () => Math.floor(Math.random() * 90) + 10);
    algorithms.forEach(algo => {
        const viz = document.getElementById(`${algo.name}-viz`);
        viz.innerHTML = '';
        renderBars([...masterArray], viz);
    });
}

function renderBars(array, container, activeIndices = [], sortedIndices = []) {
    container.innerHTML = '';
    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'bar' +
            (activeIndices.includes(index) ? ' active' : '') +
            (sortedIndices.includes(index) ? ' sorted' : '');
        bar.style.height = `${value * 2}px`;
        container.appendChild(bar);
    });
}

function updateTimer(algoName, time) {
    const timerElem = document.getElementById(`${algoName}-time`);
    if (time > 1000) {
        const seconds = (time / 1000).toFixed(2);
        timerElem.textContent = `Time: ${seconds}s`;
    } else {
        timerElem.textContent = `Time: ${time}ms`;
    }
    // Store time for ranking
    if (!window.algoTimes) window.algoTimes = {};
    window.algoTimes[algoName] = time;
    updateRankings();
}

function updateRankings() {
    const times = window.algoTimes || {};
    // Get sorted algorithm names by time (ascending)
    const sorted = Object.entries(times)
        .sort((a, b) => a[1] - b[1])
        .map(([name]) => name);
    sorted.forEach((name, idx) => {
        // Find the container by matching the algorithm title text
        const containers = document.querySelectorAll('.algorithm-container');
        containers.forEach(container => {
            const titleElem = container.querySelector('.algorithm-title');
            if (titleElem && titleElem.textContent === name) {
                let rankElem = container.querySelector('.algo-rank');
                if (!rankElem) {
                    rankElem = document.createElement('div');
                    rankElem.className = 'algo-rank';
                    rankElem.style.position = 'absolute';
                    rankElem.style.top = '8px';
                    rankElem.style.right = '12px';
                    rankElem.style.background = '#00ccff';
                    rankElem.style.color = '#1a1a1a';
                    rankElem.style.padding = '2px 8px';
                    rankElem.style.borderRadius = '8px';
                    rankElem.style.fontWeight = 'bold';
                    rankElem.style.fontSize = '0.95em';
                    container.style.position = 'relative';
                    container.appendChild(rankElem);
                }
                rankElem.textContent = `${idx + 1}${idx === 0 ? 'st' : idx === 1 ? 'nd' : idx === 2 ? 'rd' : 'th'} fastest`;
            }
        });
    });
}

async function startAllAlgorithms() {
    const startTime = Date.now();
    disableButtons(true);

    await Promise.all(algorithms.map(algo => {
        const arrayCopy = [...masterArray];
        const viz = document.getElementById(`${algo.name}-viz`);
        const timer = (time) => updateTimer(algo.name, time);
        return algo.func(arrayCopy, viz, timer);
    }));

    disableButtons(false);
    console.log(`All algorithms completed in ${Date.now() - startTime}ms`);
}

// Sorting Algorithms
async function bubbleSort(array, viz, timer) {
    const start = Date.now();
    const len = array.length;
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len - i - 1; j++) {
            if (array[j] > array[j + 1]) {
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
            }
            renderBars(array, viz, [j, j + 1]);
            await sleep(speedControl.value);
        }
        timer(Date.now() - start);
    }
    // Show final sorted state
    renderBars(array, viz, [], Array.from(array.keys()));
    return array;
}

async function quickSort(array, viz, timer) {
    const start = Date.now();

    async function partition(low, high) {
        const pivot = array[high];
        let i = low - 1;

        for (let j = low; j < high; j++) {
            if (array[j] < pivot) {
                i++;
                [array[i], array[j]] = [array[j], array[i]];
                renderBars(array, viz, [i, j, high]);
                await sleep(speedControl.value);
            }
        }

        [array[i + 1], array[high]] = [array[high], array[i + 1]];
        return i + 1;
    }

    async function sort(low, high) {
        if (low < high) {
            const pi = await partition(low, high);
            await sort(low, pi - 1);
            await sort(pi + 1, high);
            timer(Date.now() - start);
        }
    }

    await sort(0, array.length - 1);
    renderBars(array, viz, [], Array.from(array.keys()));
    return array;
}

async function mergeSort(array, viz, timer) {
    const start = Date.now();

    async function merge(start, mid, end) {
        const temp = [];
        let i = start, j = mid + 1;

        while (i <= mid && j <= end) {
            if (array[i] <= array[j]) temp.push(array[i++]);
            else temp.push(array[j++]);
        }

        while (i <= mid) temp.push(array[i++]);
        while (j <= end) temp.push(array[j++]);

        for (let k = start; k <= end; k++) {
            array[k] = temp[k - start];
            renderBars(array, viz, [k]);
            await sleep(speedControl.value);
        }
    }

    async function sort(l, r) {
        if (l < r) {
            const m = Math.floor((l + r) / 2);
            await sort(l, m);
            await sort(m + 1, r);
            await merge(l, m, r);
            timer(Date.now() - start);
        }
    }

    await sort(0, array.length - 1);
    renderBars(array, viz, [], Array.from(array.keys()));
    return array;
}

async function insertionSort(array, viz, timer) {
    const start = Date.now();
    for (let i = 1; i < array.length; i++) {
        let j = i;
        while (j > 0 && array[j] < array[j - 1]) {
            [array[j], array[j - 1]] = [array[j - 1], array[j]];
            renderBars(array, viz, [j, j - 1]);
            await sleep(speedControl.value);
            j--;
        }
        timer(Date.now() - start);
    }
    renderBars(array, viz, [], Array.from(array.keys()));
    return array;
}

async function selectionSort(array, viz, timer) {
    const start = Date.now();
    for (let i = 0; i < array.length; i++) {
        let min = i;
        for (let j = i + 1; j < array.length; j++) {
            if (array[j] < array[min]) min = j;
            renderBars(array, viz, [i, j, min]);
            await sleep(speedControl.value);
        }
        if (min !== i) {
            [array[i], array[min]] = [array[min], array[i]];
            renderBars(array, viz, [i, min]);
            await sleep(speedControl.value);
        }
        timer(Date.now() - start);
    }
    renderBars(array, viz, [], Array.from(array.keys()));
    return array;
}

async function heapSort(array, viz, timer) {
    const start = Date.now();

    async function heapify(n, i) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < n && array[left] > array[largest]) largest = left;
        if (right < n && array[right] > array[largest]) largest = right;

        if (largest !== i) {
            [array[i], array[largest]] = [array[largest], array[i]];
            renderBars(array, viz, [i, largest]);
            await sleep(speedControl.value);
            await heapify(n, largest);
        }
    }

    for (let i = Math.floor(array.length / 2) - 1; i >= 0; i--) {
        await heapify(array.length, i);
    }

    for (let i = array.length - 1; i > 0; i--) {
        [array[0], array[i]] = [array[i], array[0]];
        renderBars(array, viz, [0, i]);
        await sleep(speedControl.value);
        await heapify(i, 0);
        timer(Date.now() - start);
    }
    renderBars(array, viz, [], Array.from(array.keys()));
    return array;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function disableButtons(disabled) {
    document.querySelectorAll('button').forEach(btn => {
        btn.disabled = disabled;
    });
}

// Initialize the application
initialize();