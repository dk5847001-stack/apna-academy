import "dotenv/config";
import mongoose from "mongoose";
import DsaProblem from "../models/DsaProblem.js";

const problem = ({ slug, title, difficulty, topics, companies, patterns, isPremium, order, description }) => ({
  slug,
  title,
  description,
  difficulty,
  topics,
  companies,
  patterns,
  constraints: ["Use an efficient approach appropriate for the stated constraints."],
  examples: [{ input: "See problem statement", output: "Expected result", explanation: "Validate the output against the examples before submitting." }],
  hints: ["Identify the core data structure or pattern before coding.", "Check edge cases and the required time complexity."],
  editorial: isPremium ? "Premium editorial — available after DSA Premium unlock." : "Use the examples to derive the invariant, then implement the most direct linear or logarithmic approach.",
  solution: isPremium ? "Premium solution — available after DSA Premium unlock." : "Start with the simplest correct approach, then optimize only if the constraints require it.",
  starterCode: {
    Java: "class Solution {\n    // Write your solution here\n}",
    "C++": "class Solution {\npublic:\n    // Write your solution here\n};",
    Python: "class Solution:\n    # Write your solution here\n    pass",
    JavaScript: "class Solution {\n  // Write your solution here\n}",
  },
  supportedLanguages: ["Java", "C++", "Python", "JavaScript"],
  timeLimitMs: 2000,
  memoryLimitMb: 256,
  isPremium,
  order,
  status: "PUBLISHED",
});

const problems = [
  problem({ slug: "two-sum", title: "Two Sum", difficulty: "Easy", topics: ["Array", "Hash Table"], companies: ["Google", "Amazon", "Microsoft"], patterns: ["Hashing", "Complement Lookup"], isPremium: false, order: 1, description: "Given an array of integers and a target, return the indices of two distinct elements whose sum equals the target." }),
  problem({ slug: "valid-parentheses", title: "Valid Parentheses", difficulty: "Easy", topics: ["String", "Stack"], companies: ["Amazon", "Microsoft", "Meta"], patterns: ["Stack", "Matching"], isPremium: false, order: 2, description: "Determine whether every opening bracket in a string is closed by the correct bracket in the correct order." }),
  problem({ slug: "best-time-to-buy-and-sell-stock", title: "Best Time to Buy and Sell Stock", difficulty: "Easy", topics: ["Array", "Greedy"], companies: ["Amazon", "Microsoft", "Apple"], patterns: ["One Pass", "Greedy"], isPremium: false, order: 3, description: "Given daily stock prices, choose one day to buy and a later day to sell so that the profit is maximized." }),
  problem({ slug: "binary-search", title: "Binary Search", difficulty: "Easy", topics: ["Array", "Binary Search"], companies: ["Google", "Amazon", "Adobe"], patterns: ["Binary Search", "Divide and Conquer"], isPremium: false, order: 4, description: "Given a sorted array and a target value, return the target index or -1 when it is not present." }),
  problem({ slug: "contains-duplicate", title: "Contains Duplicate", difficulty: "Easy", topics: ["Array", "Hash Table"], companies: ["Amazon", "Apple", "Adobe"], patterns: ["Hash Set"], isPremium: true, order: 5, description: "Determine whether an integer array contains any value that appears at least twice." }),
  problem({ slug: "product-of-array-except-self", title: "Product of Array Except Self", difficulty: "Medium", topics: ["Array", "Prefix Sum"], companies: ["Amazon", "Microsoft", "Meta"], patterns: ["Prefix Product", "Suffix Product"], isPremium: true, order: 6, description: "Return an array where each position contains the product of every input value except the value at that position, without using division." }),
  problem({ slug: "maximum-subarray", title: "Maximum Subarray", difficulty: "Medium", topics: ["Array", "Dynamic Programming"], companies: ["Google", "Amazon", "Apple"], patterns: ["Kadane's Algorithm", "DP"], isPremium: true, order: 7, description: "Find the contiguous subarray with the largest sum and return that sum." }),
  problem({ slug: "merge-intervals", title: "Merge Intervals", difficulty: "Medium", topics: ["Array", "Sorting"], companies: ["Google", "Meta", "Microsoft"], patterns: ["Sort and Sweep", "Intervals"], isPremium: true, order: 8, description: "Merge all overlapping intervals and return a set of non-overlapping intervals covering the same ranges." }),
  problem({ slug: "longest-substring-without-repeating-characters", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", topics: ["String", "Hash Table", "Sliding Window"], companies: ["Amazon", "Microsoft", "Adobe"], patterns: ["Sliding Window", "Two Pointers"], isPremium: true, order: 9, description: "Find the length of the longest substring that contains no repeated characters." }),
  problem({ slug: "3sum", title: "3Sum", difficulty: "Medium", topics: ["Array", "Two Pointers", "Sorting"], companies: ["Amazon", "Microsoft", "Meta"], patterns: ["Sort + Two Pointers"], isPremium: true, order: 10, description: "Find all unique triplets in an integer array whose three values sum to zero." }),
  problem({ slug: "group-anagrams", title: "Group Anagrams", difficulty: "Medium", topics: ["String", "Hash Table", "Sorting"], companies: ["Google", "Amazon", "Uber"], patterns: ["Canonical Key", "Hashing"], isPremium: true, order: 11, description: "Group strings that are anagrams of one another and return the groups in any order." }),
  problem({ slug: "top-k-frequent-elements", title: "Top K Frequent Elements", difficulty: "Medium", topics: ["Array", "Hash Table", "Heap"], companies: ["Amazon", "Meta", "Microsoft"], patterns: ["Frequency Map", "Heap"], isPremium: true, order: 12, description: "Return the k values that occur most frequently in an integer array." }),
  problem({ slug: "number-of-islands", title: "Number of Islands", difficulty: "Medium", topics: ["Graph", "Matrix", "DFS", "BFS"], companies: ["Google", "Amazon", "Microsoft"], patterns: ["Grid DFS", "Grid BFS"], isPremium: true, order: 13, description: "Count connected groups of land cells in a binary grid where cells connect horizontally or vertically." }),
  problem({ slug: "course-schedule", title: "Course Schedule", difficulty: "Medium", topics: ["Graph", "Topological Sort"], companies: ["Amazon", "Google", "Meta"], patterns: ["Cycle Detection", "Kahn's Algorithm"], isPremium: true, order: 14, description: "Given course prerequisites, determine whether all courses can be completed without creating a dependency cycle." }),
  problem({ slug: "binary-tree-level-order-traversal", title: "Binary Tree Level Order Traversal", difficulty: "Medium", topics: ["Tree", "BFS", "Queue"], companies: ["Amazon", "Microsoft", "LinkedIn"], patterns: ["Level Order BFS"], isPremium: true, order: 15, description: "Return the values of a binary tree grouped by depth from the root level to the deepest level." }),
  problem({ slug: "lowest-common-ancestor-binary-tree", title: "Lowest Common Ancestor of a Binary Tree", difficulty: "Medium", topics: ["Tree", "DFS"], companies: ["Amazon", "Meta", "Microsoft"], patterns: ["Postorder DFS", "Tree Recursion"], isPremium: true, order: 16, description: "Find the lowest node in a binary tree that has both target nodes in its subtree." }),
  problem({ slug: "coin-change", title: "Coin Change", difficulty: "Medium", topics: ["Dynamic Programming", "Array"], companies: ["Amazon", "Google", "Apple"], patterns: ["1D DP", "Unbounded Knapsack"], isPremium: true, order: 17, description: "Given coin denominations and a target amount, return the minimum number of coins needed to make that amount, or -1 if impossible." }),
  problem({ slug: "longest-increasing-subsequence", title: "Longest Increasing Subsequence", difficulty: "Medium", topics: ["Dynamic Programming", "Binary Search"], companies: ["Microsoft", "Google", "Amazon"], patterns: ["DP", "Patience Sorting"], isPremium: true, order: 18, description: "Return the length of the longest strictly increasing subsequence in an integer array." }),
  problem({ slug: "trapping-rain-water", title: "Trapping Rain Water", difficulty: "Hard", topics: ["Array", "Two Pointers", "Stack"], companies: ["Amazon", "Google", "Meta"], patterns: ["Two Pointers", "Monotonic Stack"], isPremium: true, order: 19, description: "Given bar heights representing an elevation map, calculate how much rain water can be trapped after rainfall." }),
  problem({ slug: "median-of-two-sorted-arrays", title: "Median of Two Sorted Arrays", difficulty: "Hard", topics: ["Array", "Binary Search"], companies: ["Google", "Amazon", "Microsoft"], patterns: ["Binary Search Partition"], isPremium: true, order: 20, description: "Find the median of two sorted arrays in logarithmic time relative to the smaller array." }),
];

const run = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required.");
  await mongoose.connect(process.env.MONGO_URI);

  const operations = problems.map((item) => ({
    updateOne: {
      filter: { slug: item.slug },
      update: { $set: item },
      upsert: true,
    },
  }));

  const result = await DsaProblem.bulkWrite(operations, { ordered: false });
  const seedSlugs = problems.map(({ slug }) => slug);
  const counts = await DsaProblem.aggregate([
    { $match: { slug: { $in: seedSlugs }, status: "PUBLISHED" } },
    { $group: { _id: "$isPremium", count: { $sum: 1 } } },
  ]);

  const free = counts.find((item) => item._id === false)?.count || 0;
  const premium = counts.find((item) => item._id === true)?.count || 0;
  console.log(`DSA seed complete: ${result.upsertedCount} inserted, ${result.modifiedCount} updated.`);
  console.log(`Seed distribution: ${free} free / ${premium} premium (${free + premium ? Math.round((premium / (free + premium)) * 100) : 0}% premium).`);
};

run()
  .catch((error) => {
    console.error("DSA seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
