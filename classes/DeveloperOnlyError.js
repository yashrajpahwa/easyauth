class DeveloperOnlyError extends Error {
  constructor(args) {
    super(args);
    this.name = 'DeveloperOnly';
  }
}

module.exports = DeveloperOnlyError;
