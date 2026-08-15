import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useConversationStore } from '@/shared/stores/use-conversation-store'
import { SearchIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { useChooseConversation } from '../../hooks/use-choose-conversation'
import { useCreateConversation } from '../../hooks/use-create-conversation'
import { useUserSearch } from '../../hooks/use-user-search'
import { UserSearchResult } from './user-search-result'

export default function ConversationSearch() {
  const { keyword, setKeyword, users, isSearching } = useUserSearch();
  const createConversation = useCreateConversation();
  const { contentActive, setContentActive } = useConversationStore();
  const {
    handleChooseConversation,
  } = useChooseConversation({
    contentActive,
    setContentActive,
  });
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectUser = (user: { id: string }) => {


    
    createConversation.mutate(user.id, {
      onSuccess: (resp) => {
        if (resp?.statusCode === 200 && resp.data) {
          handleChooseConversation(resp.data);
          setKeyword("");
          setIsOpen(false);
        }
      },
    });
  };
  const showDropdown = isOpen && keyword.trim().length > 0;
  return (
    <div className="relative mx-4" ref={containerRef}>
      <label
        htmlFor="search-message"
        className="flex gap-2 p-2 border rounded-full hover:border-primary transition"
      >
        <SearchIcon className="size-5 my-auto text-gray" />
        <Input
          type="text"
          id="search-message"
          placeholder="Tìm theo tên hiển thị"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="h-auto border-0 p-0 px-1 shadow-none bg-background"
        />
      </label>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-80 overflow-auto rounded-lg border bg-background shadow-lg">
          {isSearching && (
            [0, 1, 2].map((i) => (
              <div key={i} className="px-3 py-2.5 h-16 flex items-center gap-3">
                <Skeleton className="size-11 rounded-full" />
                <Skeleton className="w-1/2 h-4 rounded-sm" />
              </div>
            ))
          )}
          {!isSearching && users && users.length < 1 && (
            <div className="h-20 w-full px-3 py-2.5 flex justify-center items-center">Không tìm thấy người dùng</div>
          )}
          {!isSearching && users && users.length > 0 && (
            <Virtuoso
              style={{ height: Math.min(users.length * 64, 320) }}
              data={users}
              itemContent={(_, user) => (
                <UserSearchResult
                  key={user.id}
                  user={user}
                  onSelect={handleSelectUser}
                  disabled={createConversation.isPending}
                />
              )}
            />
          )}
        </div>
      )}
    </div>
  )
}
