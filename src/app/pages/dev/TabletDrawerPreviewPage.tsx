import { useCallback, useMemo, useState } from "react";
import { DesktopInboxLayout } from "@/app/components/layout/DesktopInboxLayout";
import { useTabletMessagesList } from "@/app/hooks/inbox/useTabletMessagesList";
import { useIsTabletLayout } from "@/app/hooks/useMediaQuery";
import type { View } from "@/app/features/inbox/types";
import { createMessage, resetMessageIds } from "@/test/fixtures/messages";

const MOCK_MESSAGES = (() => {
  resetMessageIds();
  return [
    createMessage({ id: "msg-1", senderName: "Alex Rivera", subject: "Senior role — backend", isRead: false }),
    createMessage({ id: "msg-2", senderName: "Sam Chen", subject: "Contract opportunity", isRead: true }),
    createMessage({ id: "msg-3", senderName: "Jordan Lee", subject: "Follow-up from portfolio", isRead: false, isImportant: true }),
    createMessage({ id: "msg-4", senderName: "Taylor Kim", subject: "Quick question", isRead: true }),
    createMessage({ id: "msg-5", senderName: "Morgan Blake", subject: "Interview scheduling", isRead: false }),
  ];
})();

/** Dev-only: exercise tablet message drawer without Firebase auth. */
export function TabletDrawerPreviewPage() {
  const isTablet = useIsTabletLayout();
  const [currentView, setCurrentView] = useState<View>("inbox");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    messagesListOpen,
    onOpenMessagesList,
    onCloseMessagesList,
  } = useTabletMessagesList({
    isTablet,
    currentView,
    selectedMessageId,
  });

  const selectedMessage = useMemo(
    () => MOCK_MESSAGES.find((m) => m.id === selectedMessageId) ?? null,
    [selectedMessageId],
  );

  const handleSelectMessage = useCallback(
    (messageId: string) => {
      setSelectedMessageId(messageId);
      onCloseMessagesList();
    },
    [onCloseMessagesList],
  );

  const handleSelectView = useCallback(
    (view: View) => {
      setCurrentView(view);
      setNavMenuOpen(false);
      if (view !== "settings") onOpenMessagesList();
      else onCloseMessagesList();
    },
    [onCloseMessagesList, onOpenMessagesList],
  );

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground dark">
      <p className="shrink-0 border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center text-body-sm text-amber-200">
        Dev preview — tablet drawer UX (no sign-in). Viewport 768–1023px.
      </p>
      <div className="min-h-0 flex-1">
        <DesktopInboxLayout
          isOnline
          currentView={currentView}
          selectedMessage={selectedMessage}
          selectedMessageId={selectedMessageId}
          filteredMessages={MOCK_MESSAGES}
          inboxCount={MOCK_MESSAGES.length}
          unreadCount={MOCK_MESSAGES.filter((m) => !m.isRead).length}
          importantCount={MOCK_MESSAGES.filter((m) => m.isImportant).length}
          searchQuery={searchQuery}
          sortBy="newest"
          filterBy="all"
          navMenuOpen={navMenuOpen}
          messagesListOpen={messagesListOpen}
          onOpenNavMenu={() => setNavMenuOpen(true)}
          onCloseNavMenu={() => setNavMenuOpen(false)}
          onOpenMessagesList={onOpenMessagesList}
          onCloseMessagesList={onCloseMessagesList}
          onSelectView={handleSelectView}
          onSearchChange={setSearchQuery}
          onSortChange={() => {}}
          onFilterChange={() => {}}
          onSelectMessage={handleSelectMessage}
          onArchive={() => {}}
          onToggleImportant={() => {}}
          onDelete={() => {}}
          onMarkAsRead={() => {}}
          onReply={() => {}}
          settingsView={<p className="p-6 text-text-secondary">Settings preview</p>}
          pushEnabled={false}
          pushRegistering={false}
          pushError={null}
          onEnablePush={() => {}}
          onDisablePush={() => {}}
          onTestPush={() => {}}
        />
      </div>
    </div>
  );
}
