<script lang="ts">
import { PersonFormatter } from '$shared/formatters';

import type { Person } from 'loredata/browser';

interface Props {
	persona: Person;
	size?: string;
}

let { persona, size = 'size-14' }: Props = $props();
</script>

<img
	src={persona.avatar}
	alt={PersonFormatter.fullName(persona)}
	class="{size} rounded-full bg-surface-700 object-cover"
	loading="lazy" />
