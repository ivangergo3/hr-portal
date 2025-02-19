import { LuPlus } from "react-icons/lu";

type ProjectsPageHeaderProps = {
  showArchived: boolean;
  activeCount: number;
  archivedCount: number;
};

export function ProjectsPageHeader({
  showArchived,
  activeCount,
  archivedCount,
}: ProjectsPageHeaderProps) {
  return (
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
            <p className="mt-1 text-sm text-slate-600">
              {showArchived
                ? `${archivedCount} archived project${
                    archivedCount !== 1 ? "s" : ""
                  }`
                : `${activeCount} active project${
                    activeCount !== 1 ? "s" : ""
                  } in the system`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={showArchived ? "/projects" : "/projects?archived=true"}
              className="text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              {showArchived ? "← Active Projects" : "Show Archived"}
            </a>
            <button
              data-modal-target="add-project"
              className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              <LuPlus className="h-4 w-4" />
              Add Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
