// Code Implementations for all algorithms in Python, Java, and C++

export type ProgrammingLanguage = 'python' | 'java' | 'cpp';

export interface CodeImplementation {
  python: string;
  java: string;
  cpp: string;
}

export interface AlgorithmCode {
  id: string;
  name: string;
  category: 'sorting' | 'searching' | 'pathfinding';
  implementations: CodeImplementation;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  description: string;
}

// ========================
// SORTING ALGORITHMS
// ========================

export const bubbleSortCode: AlgorithmCode = {
  id: 'bubble-sort',
  name: 'Bubble Sort',
  category: 'sorting',
  timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
  spaceComplexity: 'O(1)',
  description: 'Compares adjacent elements and swaps them if they are in wrong order. The pass through the list is repeated until sorted.',
  implementations: {
    python: `def bubble_sort(arr):
    """
    Bubble Sort Algorithm
    Time: O(n²) | Space: O(1)
    """
    n = len(arr)

    for i in range(n - 1):
        # Flag to optimize if already sorted
        swapped = False

        for j in range(n - i - 1):
            # Compare adjacent elements
            if arr[j] > arr[j + 1]:
                # Swap if in wrong order
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True

        # If no swaps, array is sorted
        if not swapped:
            break

    return arr

# Example usage
arr = [64, 34, 25, 12, 22, 11, 90]
sorted_arr = bubble_sort(arr)
print(f"Sorted: {sorted_arr}")`,

    java: `public class BubbleSort {
    /**
     * Bubble Sort Algorithm
     * Time: O(n²) | Space: O(1)
     */
    public static void bubbleSort(int[] arr) {
        int n = arr.length;

        for (int i = 0; i < n - 1; i++) {
            // Flag to optimize if already sorted
            boolean swapped = false;

            for (int j = 0; j < n - i - 1; j++) {
                // Compare adjacent elements
                if (arr[j] > arr[j + 1]) {
                    // Swap if in wrong order
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                }
            }

            // If no swaps, array is sorted
            if (!swapped) break;
        }
    }

    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        bubbleSort(arr);
        System.out.println("Sorted: " +
            java.util.Arrays.toString(arr));
    }
}`,

    cpp: `#include <iostream>
#include <vector>
using namespace std;

/**
 * Bubble Sort Algorithm
 * Time: O(n²) | Space: O(1)
 */
void bubbleSort(vector<int>& arr) {
    int n = arr.size();

    for (int i = 0; i < n - 1; i++) {
        // Flag to optimize if already sorted
        bool swapped = false;

        for (int j = 0; j < n - i - 1; j++) {
            // Compare adjacent elements
            if (arr[j] > arr[j + 1]) {
                // Swap if in wrong order
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }

        // If no swaps, array is sorted
        if (!swapped) break;
    }
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    bubbleSort(arr);

    cout << "Sorted: ";
    for (int x : arr) cout << x << " ";
    return 0;
}`
  }
};

export const selectionSortCode: AlgorithmCode = {
  id: 'selection-sort',
  name: 'Selection Sort',
  category: 'sorting',
  timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
  spaceComplexity: 'O(1)',
  description: 'Divides the input into sorted and unsorted regions. Repeatedly selects the smallest element from unsorted and moves it to sorted.',
  implementations: {
    python: `def selection_sort(arr):
    """
    Selection Sort Algorithm
    Time: O(n²) | Space: O(1)
    """
    n = len(arr)

    for i in range(n - 1):
        # Find minimum element in unsorted portion
        min_idx = i

        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j

        # Swap minimum with first unsorted element
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]

    return arr

# Example usage
arr = [64, 25, 12, 22, 11]
sorted_arr = selection_sort(arr)
print(f"Sorted: {sorted_arr}")`,

    java: `public class SelectionSort {
    /**
     * Selection Sort Algorithm
     * Time: O(n²) | Space: O(1)
     */
    public static void selectionSort(int[] arr) {
        int n = arr.length;

        for (int i = 0; i < n - 1; i++) {
            // Find minimum element in unsorted portion
            int minIdx = i;

            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) {
                    minIdx = j;
                }
            }

            // Swap minimum with first unsorted element
            if (minIdx != i) {
                int temp = arr[i];
                arr[i] = arr[minIdx];
                arr[minIdx] = temp;
            }
        }
    }

    public static void main(String[] args) {
        int[] arr = {64, 25, 12, 22, 11};
        selectionSort(arr);
        System.out.println("Sorted: " +
            java.util.Arrays.toString(arr));
    }
}`,

    cpp: `#include <iostream>
#include <vector>
using namespace std;

/**
 * Selection Sort Algorithm
 * Time: O(n²) | Space: O(1)
 */
void selectionSort(vector<int>& arr) {
    int n = arr.size();

    for (int i = 0; i < n - 1; i++) {
        // Find minimum element in unsorted portion
        int minIdx = i;

        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }

        // Swap minimum with first unsorted element
        if (minIdx != i) {
            swap(arr[i], arr[minIdx]);
        }
    }
}

int main() {
    vector<int> arr = {64, 25, 12, 22, 11};
    selectionSort(arr);

    cout << "Sorted: ";
    for (int x : arr) cout << x << " ";
    return 0;
}`
  }
};

export const insertionSortCode: AlgorithmCode = {
  id: 'insertion-sort',
  name: 'Insertion Sort',
  category: 'sorting',
  timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
  spaceComplexity: 'O(1)',
  description: 'Builds the sorted array one element at a time by inserting each element into its correct position.',
  implementations: {
    python: `def insertion_sort(arr):
    """
    Insertion Sort Algorithm
    Time: O(n²) | Space: O(1)
    Best for small or nearly sorted arrays
    """
    n = len(arr)

    for i in range(1, n):
        # Element to be inserted
        key = arr[i]
        j = i - 1

        # Shift elements greater than key
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1

        # Insert key at correct position
        arr[j + 1] = key

    return arr

# Example usage
arr = [12, 11, 13, 5, 6]
sorted_arr = insertion_sort(arr)
print(f"Sorted: {sorted_arr}")`,

    java: `public class InsertionSort {
    /**
     * Insertion Sort Algorithm
     * Time: O(n²) | Space: O(1)
     * Best for small or nearly sorted arrays
     */
    public static void insertionSort(int[] arr) {
        int n = arr.length;

        for (int i = 1; i < n; i++) {
            // Element to be inserted
            int key = arr[i];
            int j = i - 1;

            // Shift elements greater than key
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }

            // Insert key at correct position
            arr[j + 1] = key;
        }
    }

    public static void main(String[] args) {
        int[] arr = {12, 11, 13, 5, 6};
        insertionSort(arr);
        System.out.println("Sorted: " +
            java.util.Arrays.toString(arr));
    }
}`,

    cpp: `#include <iostream>
#include <vector>
using namespace std;

/**
 * Insertion Sort Algorithm
 * Time: O(n²) | Space: O(1)
 * Best for small or nearly sorted arrays
 */
void insertionSort(vector<int>& arr) {
    int n = arr.size();

    for (int i = 1; i < n; i++) {
        // Element to be inserted
        int key = arr[i];
        int j = i - 1;

        // Shift elements greater than key
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }

        // Insert key at correct position
        arr[j + 1] = key;
    }
}

int main() {
    vector<int> arr = {12, 11, 13, 5, 6};
    insertionSort(arr);

    cout << "Sorted: ";
    for (int x : arr) cout << x << " ";
    return 0;
}`
  }
};

export const mergeSortCode: AlgorithmCode = {
  id: 'merge-sort',
  name: 'Merge Sort',
  category: 'sorting',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  spaceComplexity: 'O(n)',
  description: 'Divide and conquer algorithm that divides the array in half, sorts each half, then merges them back together.',
  implementations: {
    python: `def merge_sort(arr):
    """
    Merge Sort Algorithm
    Time: O(n log n) | Space: O(n)
    Stable sort with guaranteed performance
    """
    if len(arr) <= 1:
        return arr

    # Divide
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    # Conquer (merge)
    return merge(left, right)

def merge(left, right):
    """Merge two sorted arrays"""
    result = []
    i = j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    # Add remaining elements
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# Example usage
arr = [38, 27, 43, 3, 9, 82, 10]
sorted_arr = merge_sort(arr)
print(f"Sorted: {sorted_arr}")`,

    java: `public class MergeSort {
    /**
     * Merge Sort Algorithm
     * Time: O(n log n) | Space: O(n)
     * Stable sort with guaranteed performance
     */
    public static void mergeSort(int[] arr, int l, int r) {
        if (l < r) {
            // Divide
            int mid = l + (r - l) / 2;

            mergeSort(arr, l, mid);
            mergeSort(arr, mid + 1, r);

            // Conquer (merge)
            merge(arr, l, mid, r);
        }
    }

    private static void merge(int[] arr, int l, int m, int r) {
        // Create temp arrays
        int n1 = m - l + 1;
        int n2 = r - m;
        int[] L = new int[n1];
        int[] R = new int[n2];

        // Copy data to temp arrays
        for (int i = 0; i < n1; i++)
            L[i] = arr[l + i];
        for (int j = 0; j < n2; j++)
            R[j] = arr[m + 1 + j];

        // Merge temp arrays back
        int i = 0, j = 0, k = l;
        while (i < n1 && j < n2) {
            if (L[i] <= R[j]) {
                arr[k++] = L[i++];
            } else {
                arr[k++] = R[j++];
            }
        }

        // Copy remaining elements
        while (i < n1) arr[k++] = L[i++];
        while (j < n2) arr[k++] = R[j++];
    }

    public static void main(String[] args) {
        int[] arr = {38, 27, 43, 3, 9, 82, 10};
        mergeSort(arr, 0, arr.length - 1);
        System.out.println("Sorted: " +
            java.util.Arrays.toString(arr));
    }
}`,

    cpp: `#include <iostream>
#include <vector>
using namespace std;

/**
 * Merge Sort Algorithm
 * Time: O(n log n) | Space: O(n)
 * Stable sort with guaranteed performance
 */
void merge(vector<int>& arr, int l, int m, int r) {
    vector<int> L(arr.begin() + l, arr.begin() + m + 1);
    vector<int> R(arr.begin() + m + 1, arr.begin() + r + 1);

    int i = 0, j = 0, k = l;

    while (i < L.size() && j < R.size()) {
        if (L[i] <= R[j]) {
            arr[k++] = L[i++];
        } else {
            arr[k++] = R[j++];
        }
    }

    // Copy remaining elements
    while (i < L.size()) arr[k++] = L[i++];
    while (j < R.size()) arr[k++] = R[j++];
}

void mergeSort(vector<int>& arr, int l, int r) {
    if (l < r) {
        // Divide
        int mid = l + (r - l) / 2;

        mergeSort(arr, l, mid);
        mergeSort(arr, mid + 1, r);

        // Conquer (merge)
        merge(arr, l, mid, r);
    }
}

int main() {
    vector<int> arr = {38, 27, 43, 3, 9, 82, 10};
    mergeSort(arr, 0, arr.size() - 1);

    cout << "Sorted: ";
    for (int x : arr) cout << x << " ";
    return 0;
}`
  }
};

export const quickSortCode: AlgorithmCode = {
  id: 'quick-sort',
  name: 'Quick Sort',
  category: 'sorting',
  timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
  spaceComplexity: 'O(log n)',
  description: 'Divide and conquer algorithm that selects a pivot element and partitions the array around it.',
  implementations: {
    python: `def quick_sort(arr, low=0, high=None):
    """
    Quick Sort Algorithm
    Time: O(n log n) avg | Space: O(log n)
    In-place, not stable, very fast in practice
    """
    if high is None:
        high = len(arr) - 1

    if low < high:
        # Partition and get pivot index
        pivot_idx = partition(arr, low, high)

        # Recursively sort sub-arrays
        quick_sort(arr, low, pivot_idx - 1)
        quick_sort(arr, pivot_idx + 1, high)

    return arr

def partition(arr, low, high):
    """Partition array around pivot"""
    pivot = arr[high]  # Last element as pivot
    i = low - 1  # Index of smaller element

    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]

    # Place pivot in correct position
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

# Example usage
arr = [10, 7, 8, 9, 1, 5]
sorted_arr = quick_sort(arr)
print(f"Sorted: {sorted_arr}")`,

    java: `public class QuickSort {
    /**
     * Quick Sort Algorithm
     * Time: O(n log n) avg | Space: O(log n)
     * In-place, not stable, very fast in practice
     */
    public static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            // Partition and get pivot index
            int pivotIdx = partition(arr, low, high);

            // Recursively sort sub-arrays
            quickSort(arr, low, pivotIdx - 1);
            quickSort(arr, pivotIdx + 1, high);
        }
    }

    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[high]; // Last element as pivot
        int i = low - 1; // Index of smaller element

        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                i++;
                // Swap arr[i] and arr[j]
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }

        // Place pivot in correct position
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;

        return i + 1;
    }

    public static void main(String[] args) {
        int[] arr = {10, 7, 8, 9, 1, 5};
        quickSort(arr, 0, arr.length - 1);
        System.out.println("Sorted: " +
            java.util.Arrays.toString(arr));
    }
}`,

    cpp: `#include <iostream>
#include <vector>
using namespace std;

/**
 * Quick Sort Algorithm
 * Time: O(n log n) avg | Space: O(log n)
 * In-place, not stable, very fast in practice
 */
int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high]; // Last element as pivot
    int i = low - 1; // Index of smaller element

    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }

    // Place pivot in correct position
    swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        // Partition and get pivot index
        int pivotIdx = partition(arr, low, high);

        // Recursively sort sub-arrays
        quickSort(arr, low, pivotIdx - 1);
        quickSort(arr, pivotIdx + 1, high);
    }
}

int main() {
    vector<int> arr = {10, 7, 8, 9, 1, 5};
    quickSort(arr, 0, arr.size() - 1);

    cout << "Sorted: ";
    for (int x : arr) cout << x << " ";
    return 0;
}`
  }
};

// ========================
// SEARCHING ALGORITHMS
// ========================

export const linearSearchCode: AlgorithmCode = {
  id: 'linear-search',
  name: 'Linear Search',
  category: 'searching',
  timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(1)',
  description: 'Sequentially checks each element until the target is found or the end is reached. Works on unsorted arrays.',
  implementations: {
    python: `def linear_search(arr, target):
    """
    Linear Search Algorithm
    Time: O(n) | Space: O(1)
    Works on unsorted arrays
    """
    for i in range(len(arr)):
        if arr[i] == target:
            return i  # Found at index i

    return -1  # Not found

# Example usage
arr = [64, 25, 12, 22, 11, 90]
target = 22

result = linear_search(arr, target)
if result != -1:
    print(f"Found {target} at index {result}")
else:
    print(f"{target} not found in array")`,

    java: `public class LinearSearch {
    /**
     * Linear Search Algorithm
     * Time: O(n) | Space: O(1)
     * Works on unsorted arrays
     */
    public static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) {
                return i; // Found at index i
            }
        }
        return -1; // Not found
    }

    public static void main(String[] args) {
        int[] arr = {64, 25, 12, 22, 11, 90};
        int target = 22;

        int result = linearSearch(arr, target);
        if (result != -1) {
            System.out.println("Found " + target +
                " at index " + result);
        } else {
            System.out.println(target +
                " not found in array");
        }
    }
}`,

    cpp: `#include <iostream>
#include <vector>
using namespace std;

/**
 * Linear Search Algorithm
 * Time: O(n) | Space: O(1)
 * Works on unsorted arrays
 */
int linearSearch(vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) {
            return i; // Found at index i
        }
    }
    return -1; // Not found
}

int main() {
    vector<int> arr = {64, 25, 12, 22, 11, 90};
    int target = 22;

    int result = linearSearch(arr, target);
    if (result != -1) {
        cout << "Found " << target
             << " at index " << result << endl;
    } else {
        cout << target << " not found in array" << endl;
    }
    return 0;
}`
  }
};

export const binarySearchCode: AlgorithmCode = {
  id: 'binary-search',
  name: 'Binary Search',
  category: 'searching',
  timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
  spaceComplexity: 'O(1)',
  description: 'Efficiently searches a sorted array by repeatedly dividing the search interval in half.',
  implementations: {
    python: `def binary_search(arr, target):
    """
    Binary Search Algorithm
    Time: O(log n) | Space: O(1)
    Requires SORTED array
    """
    left, right = 0, len(arr) - 1

    while left <= right:
        mid = (left + right) // 2

        if arr[mid] == target:
            return mid  # Found!
        elif arr[mid] < target:
            left = mid + 1  # Search right half
        else:
            right = mid - 1  # Search left half

    return -1  # Not found

# Recursive version
def binary_search_recursive(arr, target, left, right):
    if left > right:
        return -1

    mid = (left + right) // 2

    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, right)
    else:
        return binary_search_recursive(arr, target, left, mid - 1)

# Example usage
arr = [2, 3, 4, 10, 40, 50, 60]  # Must be sorted!
target = 10

result = binary_search(arr, target)
if result != -1:
    print(f"Found {target} at index {result}")
else:
    print(f"{target} not found")`,

    java: `public class BinarySearch {
    /**
     * Binary Search Algorithm
     * Time: O(log n) | Space: O(1)
     * Requires SORTED array
     */
    public static int binarySearch(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;

        while (left <= right) {
            int mid = left + (right - left) / 2;

            if (arr[mid] == target) {
                return mid; // Found!
            } else if (arr[mid] < target) {
                left = mid + 1; // Search right half
            } else {
                right = mid - 1; // Search left half
            }
        }
        return -1; // Not found
    }

    // Recursive version
    public static int binarySearchRecursive(
            int[] arr, int target, int left, int right) {
        if (left > right) return -1;

        int mid = left + (right - left) / 2;

        if (arr[mid] == target) return mid;
        else if (arr[mid] < target)
            return binarySearchRecursive(arr, target, mid + 1, right);
        else
            return binarySearchRecursive(arr, target, left, mid - 1);
    }

    public static void main(String[] args) {
        int[] arr = {2, 3, 4, 10, 40, 50, 60}; // Sorted!
        int target = 10;

        int result = binarySearch(arr, target);
        if (result != -1) {
            System.out.println("Found " + target +
                " at index " + result);
        } else {
            System.out.println(target + " not found");
        }
    }
}`,

    cpp: `#include <iostream>
#include <vector>
using namespace std;

/**
 * Binary Search Algorithm
 * Time: O(log n) | Space: O(1)
 * Requires SORTED array
 */
int binarySearch(vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (arr[mid] == target) {
            return mid; // Found!
        } else if (arr[mid] < target) {
            left = mid + 1; // Search right half
        } else {
            right = mid - 1; // Search left half
        }
    }
    return -1; // Not found
}

// Recursive version
int binarySearchRecursive(vector<int>& arr, int target,
                          int left, int right) {
    if (left > right) return -1;

    int mid = left + (right - left) / 2;

    if (arr[mid] == target) return mid;
    else if (arr[mid] < target)
        return binarySearchRecursive(arr, target, mid + 1, right);
    else
        return binarySearchRecursive(arr, target, left, mid - 1);
}

int main() {
    vector<int> arr = {2, 3, 4, 10, 40, 50, 60}; // Sorted!
    int target = 10;

    int result = binarySearch(arr, target);
    if (result != -1) {
        cout << "Found " << target
             << " at index " << result << endl;
    } else {
        cout << target << " not found" << endl;
    }
    return 0;
}`
  }
};

// ========================
// PATHFINDING ALGORITHMS
// ========================

export const bfsCode: AlgorithmCode = {
  id: 'bfs',
  name: 'Breadth-First Search',
  category: 'pathfinding',
  timeComplexity: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
  spaceComplexity: 'O(V)',
  description: 'Explores all neighbors at current depth before moving deeper. Guarantees shortest path in unweighted graphs.',
  implementations: {
    python: `from collections import deque

def bfs(grid, start, end):
    """
    Breadth-First Search for grid pathfinding
    Time: O(V+E) | Space: O(V)
    Guarantees shortest path (unweighted)
    """
    rows, cols = len(grid), len(grid[0])
    directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]

    # Queue: (row, col, path)
    queue = deque([(start[0], start[1], [start])])
    visited = {start}

    while queue:
        row, col, path = queue.popleft()

        # Found destination
        if (row, col) == end:
            return path

        # Explore neighbors
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc

            # Check bounds and obstacles
            if (0 <= new_row < rows and
                0 <= new_col < cols and
                grid[new_row][new_col] != 1 and
                (new_row, new_col) not in visited):

                visited.add((new_row, new_col))
                new_path = path + [(new_row, new_col)]
                queue.append((new_row, new_col, new_path))

    return None  # No path found

# Example: 0 = empty, 1 = obstacle
grid = [
    [0, 0, 0, 0, 0],
    [1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0]
]

path = bfs(grid, (0, 0), (4, 4))
print(f"Path: {path}")`,

    java: `import java.util.*;

public class BFS {
    /**
     * Breadth-First Search for grid pathfinding
     * Time: O(V+E) | Space: O(V)
     * Guarantees shortest path (unweighted)
     */
    static int[][] directions = {{0,1}, {1,0}, {0,-1}, {-1,0}};

    public static List<int[]> bfs(int[][] grid,
            int[] start, int[] end) {
        int rows = grid.length, cols = grid[0].length;

        // Queue: stores {row, col}
        Queue<int[]> queue = new LinkedList<>();
        Map<String, int[]> parent = new HashMap<>();
        Set<String> visited = new HashSet<>();

        queue.offer(start);
        visited.add(start[0] + "," + start[1]);

        while (!queue.isEmpty()) {
            int[] curr = queue.poll();
            int row = curr[0], col = curr[1];

            // Found destination
            if (row == end[0] && col == end[1]) {
                return reconstructPath(parent, start, end);
            }

            // Explore neighbors
            for (int[] dir : directions) {
                int newRow = row + dir[0];
                int newCol = col + dir[1];
                String key = newRow + "," + newCol;

                if (newRow >= 0 && newRow < rows &&
                    newCol >= 0 && newCol < cols &&
                    grid[newRow][newCol] != 1 &&
                    !visited.contains(key)) {

                    visited.add(key);
                    parent.put(key, new int[]{row, col});
                    queue.offer(new int[]{newRow, newCol});
                }
            }
        }
        return null; // No path found
    }

    static List<int[]> reconstructPath(Map<String, int[]> parent,
            int[] start, int[] end) {
        List<int[]> path = new ArrayList<>();
        int[] curr = end;
        while (curr != null) {
            path.add(0, curr);
            String key = curr[0] + "," + curr[1];
            if (curr[0] == start[0] && curr[1] == start[1]) break;
            curr = parent.get(key);
        }
        return path;
    }
}`,

    cpp: `#include <iostream>
#include <vector>
#include <queue>
#include <set>
#include <map>
using namespace std;

/**
 * Breadth-First Search for grid pathfinding
 * Time: O(V+E) | Space: O(V)
 * Guarantees shortest path (unweighted)
 */
vector<pair<int,int>> bfs(vector<vector<int>>& grid,
        pair<int,int> start, pair<int,int> end) {

    int rows = grid.size(), cols = grid[0].size();
    int directions[4][2] = {{0,1}, {1,0}, {0,-1}, {-1,0}};

    queue<pair<int,int>> q;
    set<pair<int,int>> visited;
    map<pair<int,int>, pair<int,int>> parent;

    q.push(start);
    visited.insert(start);

    while (!q.empty()) {
        auto [row, col] = q.front();
        q.pop();

        // Found destination
        if (row == end.first && col == end.second) {
            // Reconstruct path
            vector<pair<int,int>> path;
            pair<int,int> curr = end;
            while (curr != start) {
                path.insert(path.begin(), curr);
                curr = parent[curr];
            }
            path.insert(path.begin(), start);
            return path;
        }

        // Explore neighbors
        for (auto& dir : directions) {
            int newRow = row + dir[0];
            int newCol = col + dir[1];
            pair<int,int> next = {newRow, newCol};

            if (newRow >= 0 && newRow < rows &&
                newCol >= 0 && newCol < cols &&
                grid[newRow][newCol] != 1 &&
                visited.find(next) == visited.end()) {

                visited.insert(next);
                parent[next] = {row, col};
                q.push(next);
            }
        }
    }
    return {}; // No path found
}`
  }
};

export const dijkstraCode: AlgorithmCode = {
  id: 'dijkstra',
  name: "Dijkstra's Algorithm",
  category: 'pathfinding',
  timeComplexity: { best: 'O((V+E)logV)', average: 'O((V+E)logV)', worst: 'O((V+E)logV)' },
  spaceComplexity: 'O(V)',
  description: 'Finds shortest path by always expanding the node with smallest known distance. Works with weighted edges.',
  implementations: {
    python: `import heapq

def dijkstra(grid, start, end):
    """
    Dijkstra's Algorithm for weighted pathfinding
    Time: O((V+E)logV) | Space: O(V)
    Optimal for weighted graphs
    """
    rows, cols = len(grid), len(grid[0])
    directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]

    # Priority queue: (distance, row, col)
    pq = [(0, start[0], start[1])]
    distances = {start: 0}
    parent = {start: None}

    while pq:
        dist, row, col = heapq.heappop(pq)

        # Skip if we found a better path
        if dist > distances.get((row, col), float('inf')):
            continue

        # Found destination
        if (row, col) == end:
            return reconstruct_path(parent, end)

        # Explore neighbors
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc

            if (0 <= new_row < rows and
                0 <= new_col < cols and
                grid[new_row][new_col] != -1):  # -1 = obstacle

                # Edge weight (can be cell value or 1)
                weight = grid[new_row][new_col] if grid[new_row][new_col] > 0 else 1
                new_dist = dist + weight

                if new_dist < distances.get((new_row, new_col), float('inf')):
                    distances[(new_row, new_col)] = new_dist
                    parent[(new_row, new_col)] = (row, col)
                    heapq.heappush(pq, (new_dist, new_row, new_col))

    return None  # No path found

def reconstruct_path(parent, end):
    path = []
    curr = end
    while curr:
        path.append(curr)
        curr = parent[curr]
    return path[::-1]

# Example
grid = [
    [0, 0, 0, 0],
    [-1, -1, 0, -1],
    [0, 0, 0, 0],
    [0, -1, -1, 0]
]
path = dijkstra(grid, (0, 0), (3, 3))
print(f"Shortest path: {path}")`,

    java: `import java.util.*;

public class Dijkstra {
    /**
     * Dijkstra's Algorithm for weighted pathfinding
     * Time: O((V+E)logV) | Space: O(V)
     */
    static int[][] directions = {{0,1}, {1,0}, {0,-1}, {-1,0}};

    public static List<int[]> dijkstra(int[][] grid,
            int[] start, int[] end) {
        int rows = grid.length, cols = grid[0].length;

        // Priority Queue: {distance, row, col}
        PriorityQueue<int[]> pq = new PriorityQueue<>(
            (a, b) -> a[0] - b[0]
        );

        int[][] dist = new int[rows][cols];
        for (int[] row : dist) Arrays.fill(row, Integer.MAX_VALUE);
        Map<String, int[]> parent = new HashMap<>();

        pq.offer(new int[]{0, start[0], start[1]});
        dist[start[0]][start[1]] = 0;

        while (!pq.isEmpty()) {
            int[] curr = pq.poll();
            int d = curr[0], row = curr[1], col = curr[2];

            // Skip outdated entries
            if (d > dist[row][col]) continue;

            // Found destination
            if (row == end[0] && col == end[1]) {
                return reconstructPath(parent, start, end);
            }

            // Explore neighbors
            for (int[] dir : directions) {
                int newRow = row + dir[0];
                int newCol = col + dir[1];

                if (newRow >= 0 && newRow < rows &&
                    newCol >= 0 && newCol < cols &&
                    grid[newRow][newCol] != -1) {

                    int weight = Math.max(1, grid[newRow][newCol]);
                    int newDist = d + weight;

                    if (newDist < dist[newRow][newCol]) {
                        dist[newRow][newCol] = newDist;
                        parent.put(newRow + "," + newCol,
                            new int[]{row, col});
                        pq.offer(new int[]{newDist, newRow, newCol});
                    }
                }
            }
        }
        return null; // No path found
    }

    static List<int[]> reconstructPath(Map<String, int[]> parent,
            int[] start, int[] end) {
        // Similar to BFS path reconstruction
        List<int[]> path = new ArrayList<>();
        int[] curr = end;
        while (curr != null) {
            path.add(0, curr);
            if (curr[0] == start[0] && curr[1] == start[1]) break;
            curr = parent.get(curr[0] + "," + curr[1]);
        }
        return path;
    }
}`,

    cpp: `#include <iostream>
#include <vector>
#include <queue>
#include <map>
using namespace std;

/**
 * Dijkstra's Algorithm for weighted pathfinding
 * Time: O((V+E)logV) | Space: O(V)
 */
vector<pair<int,int>> dijkstra(vector<vector<int>>& grid,
        pair<int,int> start, pair<int,int> end) {

    int rows = grid.size(), cols = grid[0].size();
    int directions[4][2] = {{0,1}, {1,0}, {0,-1}, {-1,0}};

    // Min-heap: {distance, {row, col}}
    priority_queue<pair<int, pair<int,int>>,
        vector<pair<int, pair<int,int>>>,
        greater<pair<int, pair<int,int>>>> pq;

    vector<vector<int>> dist(rows, vector<int>(cols, INT_MAX));
    map<pair<int,int>, pair<int,int>> parent;

    pq.push({0, start});
    dist[start.first][start.second] = 0;

    while (!pq.empty()) {
        auto [d, curr] = pq.top();
        pq.pop();
        int row = curr.first, col = curr.second;

        // Skip outdated entries
        if (d > dist[row][col]) continue;

        // Found destination
        if (curr == end) {
            // Reconstruct path
            vector<pair<int,int>> path;
            pair<int,int> c = end;
            while (c != start) {
                path.insert(path.begin(), c);
                c = parent[c];
            }
            path.insert(path.begin(), start);
            return path;
        }

        // Explore neighbors
        for (auto& dir : directions) {
            int newRow = row + dir[0];
            int newCol = col + dir[1];

            if (newRow >= 0 && newRow < rows &&
                newCol >= 0 && newCol < cols &&
                grid[newRow][newCol] != -1) {

                int weight = max(1, grid[newRow][newCol]);
                int newDist = d + weight;

                if (newDist < dist[newRow][newCol]) {
                    dist[newRow][newCol] = newDist;
                    parent[{newRow, newCol}] = {row, col};
                    pq.push({newDist, {newRow, newCol}});
                }
            }
        }
    }
    return {}; // No path found
}`
  }
};

export const astarCode: AlgorithmCode = {
  id: 'astar',
  name: 'A* Search',
  category: 'pathfinding',
  timeComplexity: { best: 'O(E)', average: 'O(E)', worst: 'O(V²)' },
  spaceComplexity: 'O(V)',
  description: 'Uses heuristics to guide search toward the goal. Combines benefits of Dijkstra and greedy search for optimal pathfinding.',
  implementations: {
    python: `import heapq

def heuristic(a, b):
    """Manhattan distance heuristic"""
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def a_star(grid, start, end):
    """
    A* Search Algorithm
    Time: O(E) best case | Space: O(V)
    Optimal with admissible heuristic
    """
    rows, cols = len(grid), len(grid[0])
    directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]

    # Priority queue: (f_cost, g_cost, row, col)
    open_set = [(heuristic(start, end), 0, start[0], start[1])]
    g_score = {start: 0}
    parent = {start: None}
    closed_set = set()

    while open_set:
        f, g, row, col = heapq.heappop(open_set)
        current = (row, col)

        if current in closed_set:
            continue
        closed_set.add(current)

        # Found destination
        if current == end:
            return reconstruct_path(parent, end)

        # Explore neighbors
        for dr, dc in directions:
            neighbor = (row + dr, col + dc)

            if (0 <= neighbor[0] < rows and
                0 <= neighbor[1] < cols and
                grid[neighbor[0]][neighbor[1]] != 1 and
                neighbor not in closed_set):

                tentative_g = g + 1

                if tentative_g < g_score.get(neighbor, float('inf')):
                    g_score[neighbor] = tentative_g
                    f_score = tentative_g + heuristic(neighbor, end)
                    parent[neighbor] = current
                    heapq.heappush(open_set,
                        (f_score, tentative_g, neighbor[0], neighbor[1]))

    return None  # No path found

def reconstruct_path(parent, end):
    path = []
    current = end
    while current:
        path.append(current)
        current = parent[current]
    return path[::-1]

# Example
grid = [
    [0, 0, 0, 0, 0],
    [1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0]
]
path = a_star(grid, (0, 0), (4, 4))
print(f"A* path: {path}")`,

    java: `import java.util.*;

public class AStar {
    /**
     * A* Search Algorithm
     * Time: O(E) best case | Space: O(V)
     * Optimal with admissible heuristic
     */
    static int[][] directions = {{0,1}, {1,0}, {0,-1}, {-1,0}};

    static int heuristic(int[] a, int[] b) {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    }

    public static List<int[]> aStar(int[][] grid,
            int[] start, int[] end) {
        int rows = grid.length, cols = grid[0].length;

        // Priority Queue: {f_score, g_score, row, col}
        PriorityQueue<int[]> openSet = new PriorityQueue<>(
            (a, b) -> a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]
        );

        int[][] gScore = new int[rows][cols];
        for (int[] row : gScore) Arrays.fill(row, Integer.MAX_VALUE);

        Map<String, int[]> parent = new HashMap<>();
        Set<String> closedSet = new HashSet<>();

        gScore[start[0]][start[1]] = 0;
        int h = heuristic(start, end);
        openSet.offer(new int[]{h, 0, start[0], start[1]});

        while (!openSet.isEmpty()) {
            int[] curr = openSet.poll();
            int f = curr[0], g = curr[1];
            int row = curr[2], col = curr[3];
            String key = row + "," + col;

            if (closedSet.contains(key)) continue;
            closedSet.add(key);

            // Found destination
            if (row == end[0] && col == end[1]) {
                return reconstructPath(parent, start, end);
            }

            // Explore neighbors
            for (int[] dir : directions) {
                int newRow = row + dir[0];
                int newCol = col + dir[1];
                String nKey = newRow + "," + newCol;

                if (newRow >= 0 && newRow < rows &&
                    newCol >= 0 && newCol < cols &&
                    grid[newRow][newCol] != 1 &&
                    !closedSet.contains(nKey)) {

                    int tentativeG = g + 1;

                    if (tentativeG < gScore[newRow][newCol]) {
                        gScore[newRow][newCol] = tentativeG;
                        int fScore = tentativeG +
                            heuristic(new int[]{newRow, newCol}, end);
                        parent.put(nKey, new int[]{row, col});
                        openSet.offer(new int[]{fScore, tentativeG,
                            newRow, newCol});
                    }
                }
            }
        }
        return null; // No path found
    }

    static List<int[]> reconstructPath(Map<String, int[]> parent,
            int[] start, int[] end) {
        List<int[]> path = new ArrayList<>();
        int[] curr = end;
        while (curr != null) {
            path.add(0, curr);
            if (curr[0] == start[0] && curr[1] == start[1]) break;
            curr = parent.get(curr[0] + "," + curr[1]);
        }
        return path;
    }
}`,

    cpp: `#include <iostream>
#include <vector>
#include <queue>
#include <map>
#include <set>
#include <cmath>
using namespace std;

/**
 * A* Search Algorithm
 * Time: O(E) best case | Space: O(V)
 * Optimal with admissible heuristic
 */
int heuristic(pair<int,int> a, pair<int,int> b) {
    return abs(a.first - b.first) + abs(a.second - b.second);
}

vector<pair<int,int>> aStar(vector<vector<int>>& grid,
        pair<int,int> start, pair<int,int> end) {

    int rows = grid.size(), cols = grid[0].size();
    int directions[4][2] = {{0,1}, {1,0}, {0,-1}, {-1,0}};

    // Min-heap: {f_score, g_score, {row, col}}
    auto cmp = [](auto& a, auto& b) {
        return a.first > b.first;
    };
    priority_queue<pair<int, pair<int, pair<int,int>>>,
        vector<pair<int, pair<int, pair<int,int>>>>,
        decltype(cmp)> openSet(cmp);

    map<pair<int,int>, int> gScore;
    map<pair<int,int>, pair<int,int>> parent;
    set<pair<int,int>> closedSet;

    gScore[start] = 0;
    int h = heuristic(start, end);
    openSet.push({h, {0, start}});

    while (!openSet.empty()) {
        auto [f, gp] = openSet.top();
        auto [g, curr] = gp;
        openSet.pop();

        if (closedSet.count(curr)) continue;
        closedSet.insert(curr);

        // Found destination
        if (curr == end) {
            vector<pair<int,int>> path;
            pair<int,int> c = end;
            while (c != start) {
                path.insert(path.begin(), c);
                c = parent[c];
            }
            path.insert(path.begin(), start);
            return path;
        }

        // Explore neighbors
        for (auto& dir : directions) {
            int newRow = curr.first + dir[0];
            int newCol = curr.second + dir[1];
            pair<int,int> neighbor = {newRow, newCol};

            if (newRow >= 0 && newRow < rows &&
                newCol >= 0 && newCol < cols &&
                grid[newRow][newCol] != 1 &&
                !closedSet.count(neighbor)) {

                int tentativeG = g + 1;

                if (!gScore.count(neighbor) ||
                    tentativeG < gScore[neighbor]) {
                    gScore[neighbor] = tentativeG;
                    int fScore = tentativeG + heuristic(neighbor, end);
                    parent[neighbor] = curr;
                    openSet.push({fScore, {tentativeG, neighbor}});
                }
            }
        }
    }
    return {}; // No path found
}`
  }
};

// ========================
// DYNAMIC PROGRAMMING
// ========================

export const fibonacciCode: AlgorithmCode = {
  id: 'fibonacci',
  name: 'Fibonacci (DP)',
  category: 'sorting', // Using 'sorting' as a generic category for compatibility
  timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  spaceComplexity: 'O(n)',
  description: 'Computes Fibonacci numbers using dynamic programming with memoization. Transforms O(2^n) recursive solution to O(n) iterative.',
  implementations: {
    python: `def fibonacci(n):
    """
    Fibonacci using Dynamic Programming
    Time: O(n) | Space: O(n)
    Bottom-up tabulation approach
    """
    if n <= 1:
        return n

    # Memoization table
    dp = [0] * (n + 1)
    dp[0], dp[1] = 0, 1

    for i in range(2, n + 1):
        # F(i) = F(i-1) + F(i-2)
        dp[i] = dp[i-1] + dp[i-2]

    return dp[n]

# Space-optimized version
def fibonacci_optimized(n):
    """
    Fibonacci with O(1) space
    Only stores last two values
    """
    if n <= 1:
        return n

    prev2, prev1 = 0, 1

    for i in range(2, n + 1):
        curr = prev1 + prev2
        prev2, prev1 = prev1, curr

    return prev1

# Example usage
n = 10
result = fibonacci(n)
print(f"F({n}) = {result}")
print(f"Sequence: {[fibonacci(i) for i in range(n+1)]}")`,

    java: `public class Fibonacci {
    /**
     * Fibonacci using Dynamic Programming
     * Time: O(n) | Space: O(n)
     * Bottom-up tabulation approach
     */
    public static long fibonacci(int n) {
        if (n <= 1) return n;

        // Memoization table
        long[] dp = new long[n + 1];
        dp[0] = 0;
        dp[1] = 1;

        for (int i = 2; i <= n; i++) {
            // F(i) = F(i-1) + F(i-2)
            dp[i] = dp[i-1] + dp[i-2];
        }

        return dp[n];
    }

    /**
     * Space-optimized version O(1) space
     */
    public static long fibonacciOptimized(int n) {
        if (n <= 1) return n;

        long prev2 = 0, prev1 = 1;

        for (int i = 2; i <= n; i++) {
            long curr = prev1 + prev2;
            prev2 = prev1;
            prev1 = curr;
        }

        return prev1;
    }

    public static void main(String[] args) {
        int n = 10;
        System.out.println("F(" + n + ") = " + fibonacci(n));

        System.out.print("Sequence: ");
        for (int i = 0; i <= n; i++) {
            System.out.print(fibonacci(i) + " ");
        }
    }
}`,

    cpp: `#include <iostream>
#include <vector>
using namespace std;

/**
 * Fibonacci using Dynamic Programming
 * Time: O(n) | Space: O(n)
 * Bottom-up tabulation approach
 */
long long fibonacci(int n) {
    if (n <= 1) return n;

    // Memoization table
    vector<long long> dp(n + 1);
    dp[0] = 0;
    dp[1] = 1;

    for (int i = 2; i <= n; i++) {
        // F(i) = F(i-1) + F(i-2)
        dp[i] = dp[i-1] + dp[i-2];
    }

    return dp[n];
}

/**
 * Space-optimized version O(1) space
 */
long long fibonacciOptimized(int n) {
    if (n <= 1) return n;

    long long prev2 = 0, prev1 = 1;

    for (int i = 2; i <= n; i++) {
        long long curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }

    return prev1;
}

int main() {
    int n = 10;
    cout << "F(" << n << ") = " << fibonacci(n) << endl;

    cout << "Sequence: ";
    for (int i = 0; i <= n; i++) {
        cout << fibonacci(i) << " ";
    }
    cout << endl;

    return 0;
}`
  }
};

// Export all algorithm codes
export const algorithmCodes: Record<string, AlgorithmCode> = {
  // Sorting
  'bubble-sort': bubbleSortCode,
  'selection-sort': selectionSortCode,
  'insertion-sort': insertionSortCode,
  'merge-sort': mergeSortCode,
  'quick-sort': quickSortCode,
  // Searching
  'linear-search': linearSearchCode,
  'binary-search': binarySearchCode,
  // Pathfinding
  'bfs': bfsCode,
  'dijkstra': dijkstraCode,
  'astar': astarCode,
  // Dynamic Programming
  'fibonacci': fibonacciCode,
};

export const getAlgorithmCode = (algorithmId: string): AlgorithmCode | undefined => {
  return algorithmCodes[algorithmId];
};

export const languageNames: Record<ProgrammingLanguage, string> = {
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
};

export const languageIcons: Record<ProgrammingLanguage, string> = {
  python: '🐍',
  java: '☕',
  cpp: '⚡',
};
