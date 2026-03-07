/**
 * Runs before all tests.
 */
import dotenv from 'dotenv';

const originalConfig = dotenv.config.bind(dotenv);
dotenv.config = (options = {}) => originalConfig({...options, quiet: true});
