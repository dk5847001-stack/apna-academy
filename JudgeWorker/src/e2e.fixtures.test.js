import test from "node:test";
import assert from "node:assert/strict";

const cases = [
  {
    name: "JavaScript accepted",
    language: "JavaScript",
    slug: "two-sum",
    code: "class Solution { twoSum(nums, target) { return [0, 1]; } }",
    expected: "Accepted",
  },
  {
    name: "Java compilation error",
    language: "Java",
    slug: "two-sum",
    code: "class Solution { twoSum(int[] nums, int target) { return ; } }",
    expected: "Compilation Error",
  },
  {
    name: "C++ accepted",
    language: "C++",
    slug: "maximum-subarray",
    code: "class Solution { public: int maxSubArray(vector<int>& nums) { int best=nums[0],cur=nums[0]; for(size_t i=1;i<nums.size();++i){cur=max(nums[i],cur+nums[i]);best=max(best,cur);} return best; } };",
    expected: "Accepted",
  },
  {
    name: "Python accepted",
    language: "Python",
    slug: "valid-parentheses",
    code: "class Solution:\n    def isValid(self, s):\n        pairs={')':'(',']':'[','}':'{'}\n        stack=[]\n        for ch in s:\n            if ch in pairs:\n                if not stack or stack.pop()!=pairs[ch]: return False\n            else: stack.append(ch)\n        return not stack",
    expected: "Accepted",
  },
  {
    name: "Number of Islands fixture uses string rows",
    language: "Java",
    slug: "number-of-islands",
    code: "class Solution { public int numIslands(char[][] grid) { return 1; } }",
    expected: "Accepted",
  },
];

test("DSA judge E2E fixtures are complete", () => {
  assert.equal(cases.length, 5);
  assert.deepEqual(new Set(cases.map((item) => item.language)), new Set(["Java", "C++", "Python", "JavaScript"]));
  assert.ok(cases.some((item) => item.expected === "Compilation Error"));
  assert.ok(cases.some((item) => item.slug === "number-of-islands"));
  for (const item of cases) {
    assert.ok(item.code.trim().length > 0, item.name);
    assert.ok(item.slug.length > 0, item.name);
  }
});
