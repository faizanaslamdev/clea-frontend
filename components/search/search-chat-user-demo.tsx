import { SearchIcon } from 'lucide-react';
import { buildUserSearchDemoSummary } from '@/lib/domain/search/user-search-demo';

interface SearchChatUserDemoProps {
  query: string;
}

/** Demo context shown under every user message in the chat thread. */
export function SearchChatUserDemo({ query }: SearchChatUserDemoProps) {
  const { status, tags } = buildUserSearchDemoSummary(query);

  return (
    <div className="search-chat-user-demo" aria-label="Search context">
      <p className="search-chat-user-demo__status">
        <SearchIcon className="size-3.5 shrink-0" aria-hidden />
        {status}
      </p>
      <ul className="search-chat-user-demo__tags">
        {tags.map((tag) => (
          <li key={tag}>
            <span className="search-chat-user-demo__tag">{tag}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
