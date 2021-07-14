import * as mongoose from 'mongoose';

export let repoSchema = mongoose.model('ProcessRepo', {
  rootProcessID: String,
  rootProcessName: String,
  bpmnModel: String,
  solidityCode: String,
  abi: String,
  bytecode: String,
  indexToElement: [mongoose.Schema.Types.Mixed],
  worklistAbi: String,
});

export let registrySchema = mongoose.model('RegistryRepo', {
  address: String,
  solidityCode: String,
  abi: String,
  bytecode: String,
});

export let policySchema = mongoose.model('PolicyRepo', {
  address: String,
  model: String,
  solidityCode: String,
  abi: String,
  bytecode: String,
  indexToRole: [String],
  accessControlAbi: String,
  accessControlBytecode: String,
});

export let roleTaskSchema = mongoose.model('RoleTaskRepo', {
  address: String,
  solidityCode: String,
  abi: String,
  bytecode: String,
});

export let userSchema = mongoose.model('UserRepo', {
  username: { type: String, unique: true, required: true },
  hash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  createdDate: { type: Date, default: Date.now }
});

export let toJson = mongoose.model('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
      delete ret._id;
      delete ret.hash;
  }
});