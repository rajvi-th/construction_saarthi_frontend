import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Trash2 } from "lucide-react";
import { useAuth } from "../../auth/store";
import { useMembers } from "../hooks";
import { statusBadgeColors } from "../../../components/ui/StatusBadge";
import DropdownMenu from "../../../components/ui/DropdownMenu";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/layout/PageHeader";
import ActionBar from "../../../components/layout/ActionBar";
import MemberModal from "../components/MemberModal";

const Members = () => {
  const { t } = useTranslation("dashboard");
  const { t: tAuth } = useTranslation("auth");
  const { t: tCommon } = useTranslation("common");
  const { selectedWorkspace, user: currentUser } = useAuth();
  const {
    members,
    isLoadingMembers,
    isDeletingMember,
    refetch,
    deleteMember: deleteMemberAPI,
  } = useMembers(selectedWorkspace);

  // Workspace colors for avatar (same as SidebarHeader)
  const WORKSPACE_COLORS = [
    "red",
    "green",
    "yellow",
    "blue",
    "purple",
    "pink",
    "darkblue",
  ];

  const [searchQuery, setSearchQuery] = useState("");
  // Sorting: fixed to 'name' only. Use `sortOrder` for ascending/descending.
  const sortBy = "name";
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' | 'desc'
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);

  // Get avatar color based on name or index (using WORKSPACE_COLORS)
  // Colors will cycle/repeat when all colors are used
  const getAvatarColor = (name, memberColor, index = 0) => {
    // If member has a color property, use it if it's in WORKSPACE_COLORS
    if (memberColor && WORKSPACE_COLORS.includes(memberColor)) {
      return memberColor;
    }
    // Otherwise, assign color based on index (cycles through all colors)
    const colorIndex = index % WORKSPACE_COLORS.length;
    return WORKSPACE_COLORS[colorIndex];
  };

  // Get avatar style
  const getAvatarStyle = (color) => {
    const colorKey = color || "red";
    const colors = statusBadgeColors[colorKey] || statusBadgeColors.red;
    return {
      backgroundColor: colors.background,
      borderColor: colors.border,
      color: colors.text,
    };
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "U";
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Check if member is current user
  const isCurrentUser = (member) => {
    const memberId = member.id || member.member_id || member.user_id;
    const userId = currentUser?.id || currentUser?.user_id;
    return memberId === userId;
  };

  // Filter and sort members
  const filteredAndSortedMembers = useMemo(() => {
    let filtered = members.filter((member) => {
      const name = member.name || member.full_name || "";
      const phone = member.phone || member.phone_number || "";
      const role =
        typeof member.role === "string"
          ? member.role
          : member.role?.name || member.role_name || "";
      const searchLower = searchQuery.toLowerCase();

      return (
        name.toLowerCase().includes(searchLower) ||
        phone.includes(searchLower) ||
        role.toLowerCase().includes(searchLower)
      );
    });

    // Sort members by name only, respecting sortOrder
    filtered.sort((a, b) => {
      const nameA = (a.name || a.full_name || "").toLowerCase();
      const nameB = (b.name || b.full_name || "").toLowerCase();
      const cmp = nameA.localeCompare(nameB);
      return sortOrder === "asc" ? cmp : -cmp;
    });

    // Move current user to top
    filtered.sort((a, b) => {
      const aIsCurrent = isCurrentUser(a);
      const bIsCurrent = isCurrentUser(b);
      if (aIsCurrent && !bIsCurrent) return -1;
      if (!aIsCurrent && bIsCurrent) return 1;
      return 0;
    });

    return filtered;
  }, [members, searchQuery, sortBy, sortOrder, currentUser]);

  // Handle edit member
  const handleEditMember = (member) => {
    setMemberToEdit(member);
    setIsMemberModalOpen(true);
  };

  // Handle delete member
  const handleDeleteClick = (member) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) {
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
      return;
    }

    const memberId =
      memberToDelete.id || memberToDelete.member_id || memberToDelete.user_id;
    const success = await deleteMemberAPI(memberId);

    if (success) {
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
    }
  };

  // Handle add member
  const handleAddMember = () => {
    setMemberToEdit(null);
    setIsMemberModalOpen(true);
  };

  // Handle member modal close
  const handleMemberModalClose = () => {
    setIsMemberModalOpen(false);
    setMemberToEdit(null);
  };

  // Handle member modal success (refresh list)
  const handleMemberModalSuccess = () => {
    refetch();
  };

  // Get role name
  const getRoleName = (member) => {
    // Handle role as string or object
    if (typeof member.role === "string") {
      return member.role.charAt(0).toUpperCase() + member.role.slice(1);
    }
    return member.role?.name || member.role_name || member.role || "Member";
  };

  // Format phone number
  const formatPhone = (member) => {
    const countryCode = member.country_code || "+91";
    const phone = member.phone || member.phone_number || "";
    return phone ? `${countryCode} ${phone}` : "N/A";
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader title={t("members.title", { defaultValue: "Members" })}>
          <ActionBar
            searchValue={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={() =>
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
            }
            actionButtonLabel={tAuth("createWorkspace.addNewMember.addMember", {
              defaultValue: "Add Member",
            })}
            onActionClick={handleAddMember}
            actionButtonIcon="Plus"
          />
        </PageHeader>

        {/* Members List */}
        {isLoadingMembers ? (
          <div className="flex items-center justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : filteredAndSortedMembers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-secondary text-sm sm:text-base">
              {searchQuery
                ? t("members.noResults", { defaultValue: "No members found" })
                : t("members.noMembers", { defaultValue: "No members yet" })}
            </p>
          </div>
        ) : (
          <div>
            <div>
              {filteredAndSortedMembers.map((member, index) => {
                const memberId =
                  member.id || member.member_id || member.user_id;
                const name = member.name || member.full_name || "Unknown";
                const avatarColor = getAvatarColor(name, member.color, index);
                const isYou = isCurrentUser(member);
                const isLastItem =
                  index === filteredAndSortedMembers.length - 1;

                return (
                  <div
                    key={memberId}
                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 transition-colors ${!isLastItem ? "border-b border-gray-200" : ""}`}
                  >
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-semibold text-sm sm:text-base flex-shrink-0 border-1"
                      style={getAvatarStyle(avatarColor)}
                    >
                      {getInitials(name)}
                    </div>

                    {/* Member Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-medium text-primary">
                          {name}
                        </h3>
                        {isYou && (
                          <span className="text-xs sm:text-sm text-secondary">
                            {t("members.you", { defaultValue: "(You)" })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-secondary mt-0.5">
                        {formatPhone(member)}
                      </p>
                    </div>

                    {/* Role */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xs sm:text-sm font-medium text-primary whitespace-nowrap">
                        {getRoleName(member)}
                      </span>

                      {/* Menu (not shown for current user/owner) */}
                      {!isYou && (
                        <DropdownMenu
                          items={[
                            {
                              label: tCommon("edit", { defaultValue: "Edit" }),
                              icon: <Pencil className="w-4 h-4" />,
                              onClick: () => handleEditMember(member),
                            },
                            {
                              label: tCommon("delete", {
                                defaultValue: "Delete",
                              }),
                              icon: <Trash2 className="w-4 h-4 text-accent" />,
                              onClick: () => handleDeleteClick(member),
                              textColor: "text-accent",
                            },
                          ]}
                          openUpward={isLastItem}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && memberToDelete && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setMemberToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          title={t("members.deleteConfirmTitle", {
            defaultValue: "Delete Member",
          })}
          message={
            <p>
              {t("members.deleteConfirmMessage", {
                defaultValue: "Are you sure you want to delete",
              })}{" "}
              <span className="font-medium text-primary">
                {memberToDelete.name || memberToDelete.full_name}
              </span>
              ?
            </p>
          }
          confirmText={tCommon("delete", { defaultValue: "Delete" })}
          cancelText={tCommon("cancel", { defaultValue: "Cancel" })}
          variant="danger"
          isLoading={isDeletingMember}
        />
      )}

      {/* Add/Edit Member Modal */}
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={handleMemberModalClose}
        member={memberToEdit}
        onSuccess={handleMemberModalSuccess}
      />
    </>
  );
};

export default Members;
