"use strict";
/**
 * Safe Multisig Transaction Proposer for EVM Networks
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeManager = exports.validateEnvironment = exports.getSafeConfig = exports.getProposerConfig = void 0;
var config_1 = require("./config");
Object.defineProperty(exports, "getProposerConfig", { enumerable: true, get: function () { return config_1.getProposerConfig; } });
Object.defineProperty(exports, "getSafeConfig", { enumerable: true, get: function () { return config_1.getSafeConfig; } });
Object.defineProperty(exports, "validateEnvironment", { enumerable: true, get: function () { return config_1.validateEnvironment; } });
var safe_manager_1 = require("./safe-manager");
Object.defineProperty(exports, "SafeManager", { enumerable: true, get: function () { return safe_manager_1.SafeManager; } });
__exportStar(require("./utils/utils"), exports);
//# sourceMappingURL=index.js.map