import type { UserConfig } from '@commitlint/types';
import { RuleConfigSeverity } from '@commitlint/types';

const Config: UserConfig = {
    extends: ['@commitlint/config-conventional', '@commitlint/config-lerna-scopes'],
    rules: {
        'scope-enum': [RuleConfigSeverity.Error, 'always', [
            'client',
            'server',
            'shared'
        ]]
    }
}

export default Config;

