import "dotenv/config";
import mongoose from "mongoose";
import DsaProblem from "../models/DsaProblem.js";
import DsaTestCase from "../models/DsaTestCase.js";

const tc = (args, expectedOutput, isHidden = true, order = 0) => ({
  input: JSON.stringify({ args }),
  expectedOutput: JSON.stringify(expectedOutput),
  isHidden,
  order,
});

const cases = {
  "two-sum": [tc([[2,7,11,15],9],[0,1],false,1),tc([[3,2,4],6],[1,2],true,2)],
  "valid-parentheses": [tc(["()[]{}"],true,false,1),tc(["([)]"],false,true,2)],
  "best-time-to-buy-and-sell-stock": [tc([[7,1,5,3,6,4]],5,false,1),tc([[7,6,4,3,1]],0,true,2)],
  "binary-search": [tc([[-1,0,3,5,9,12],9],4,false,1),tc([[5],2],-1,true,2)],
  "contains-duplicate": [tc([[1,2,3,1]],true,false,1),tc([[1,2,3,4]],false,true,2)],
  "product-of-array-except-self": [tc([[1,2,3,4]],[24,12,8,6],false,1),tc([[-1,1,0,-3,3],[0,0,9,0,0]],true,2)],
  "maximum-subarray": [tc([[-2,1,-3,4,-1,2,1,-5,4]],6,false,1),tc([[5,4,-1,7,8]],23,true,2)],
  "merge-intervals": [tc([[[1,3],[2,6],[8,10],[15,18]]],[[1,6],[8,10],[15,18]],false,1),tc([[[1,4],[4,5]]],[[1,5]],true,2)],
  "longest-substring-without-repeating-characters": [tc(["abcabcbb"],3,false,1),tc(["bbbbb"],1,true,2)],
  "3sum": [tc([[-1,0,1,2,-1,-4]],[[-1,-1,2],[-1,0,1]],false,1),tc([[0,1,1]],[],true,2)],
  "group-anagrams": [tc([["eat","tea","tan","ate","nat","bat"]],[["eat","tea","ate"],["tan","nat"],["bat"]],false,1),tc([[""]],[[""]],true,2)],
  "top-k-frequent-elements": [tc([[1,1,1,2,2,3],2],[1,2],false,1),tc([[1],1],[1],true,2)],
  "number-of-islands": [tc([["11110","11010","11000","00000"]],1,false,1),tc([["11000","11000","00100","00011"]],3,true,2)],
  "course-schedule": [tc([2,[[1,0]]],true,false,1),tc([2,[[1,0],[0,1]]],false,true,2)],
  "binary-tree-level-order-traversal": [tc([[3,9,20,null,null,15,7]],[[3],[9,20],[15,7]],false,1),tc([[1]],[[1]],true,2)],
  "lowest-common-ancestor-binary-tree": [tc([[3,5,1,6,2,0,8,null,null,7,4],5,1],3,false,1),tc([[3,5,1,6,2,0,8,null,null,7,4],5,4],5,true,2)],
  "coin-change": [tc([[1,2,5],11],3,false,1),tc([[2],3],-1,true,2)],
  "longest-increasing-subsequence": [tc([[10,9,2,5,3,7,101,18]],4,false,1),tc([[0,1,0,3,2,3]],4,true,2)],
  "trapping-rain-water": [tc([[0,1,0,2,1,0,1,3,2,1,2,1]],6,false,1),tc([[4,2,0,3,2,5]],9,true,2)],
  "median-of-two-sorted-arrays": [tc([[1,3],[2]],2,false,1),tc([[1,2],[3,4]],2.5,true,2)],
};

const run = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required.");
  await mongoose.connect(process.env.MONGO_URI);
  let total = 0;
  for (const [slug, tests] of Object.entries(cases)) {
    const problem = await DsaProblem.findOne({ slug, status: "PUBLISHED" }).select("_id").lean();
    if (!problem) throw new Error(`Published problem not found: ${slug}`);
    await DsaTestCase.deleteMany({ problemId: problem._id });
    await DsaTestCase.insertMany(tests.map((item) => ({ ...item, problemId: problem._id })));
    total += tests.length;
  }
  console.log(`DSA test-case seed complete: ${total} cases across ${Object.keys(cases).length} problems.`);
};

run().catch((error) => {
  console.error("DSA test-case seed failed:", error.message);
  process.exitCode = 1;
}).finally(async () => {
  await mongoose.connection.close();
});
