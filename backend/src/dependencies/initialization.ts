const init = async (): Promise<void> => {
  /**
   * Any async initialization
   */
};

/**
 * The initialization Promise that should run before Lambda handlers are invoked
 */
export const initializationPromise = init();
