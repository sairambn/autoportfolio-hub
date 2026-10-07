//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-DruqyK9R.js
var manifest = {
  f5395a2951c040e8cbbe2cc3c7569a3d0b2e4a85132573114a019a7ee625c68b: {
    functionName: "publishToGithub_createServerFn_handler",
    importer: () => import("./_ssr/github.functions-D9A8AzlX.mjs"),
  },
};
async function getServerFnById(id, access) {
  const serverFnInfo = manifest[id];
  if (!serverFnInfo) throw new Error("Server function info not found for " + id);
  const fnModule = (serverFnInfo.module ??= await serverFnInfo.importer());
  if (!fnModule) throw new Error("Server function module not resolved for " + id);
  const action = fnModule[serverFnInfo.functionName];
  if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
  return action;
}
//#endregion
export { getServerFnById as t };
