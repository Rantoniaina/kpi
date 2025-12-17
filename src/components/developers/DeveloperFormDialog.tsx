import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { EnhancedDateField } from "@/components/ui/enhanced-date-picker";
import { DeveloperRoleSelect } from "@/components/ui/select-field";
import type { CreateDeveloperInput, Developer, UpdateDeveloperInput } from "@/types";

// Validation schema
const developerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  role: z.enum(["junior", "mid", "senior", "lead"], {
    message: "Role is required",
  }),
  team: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
});

type DeveloperFormData = z.infer<typeof developerSchema>;

interface DeveloperFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateDeveloperInput | UpdateDeveloperInput) => Promise<void>;
  developer?: Developer; // If provided, form is in edit mode
}

export function DeveloperFormDialog({
  open,
  onOpenChange,
  onSubmit,
  developer,
}: DeveloperFormDialogProps) {
  const isEditMode = !!developer;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<DeveloperFormData>({
    resolver: zodResolver(developerSchema),
    defaultValues: developer
      ? {
          name: developer.name,
          email: developer.email,
          role: developer.role,
          team: developer.team || "",
          startDate: developer.startDate,
        }
      : {
          name: "",
          email: "",
          role: undefined,
          team: "",
          startDate: new Date().toISOString().split("T")[0],
        },
  });

  const roleValue = watch("role");
  const startDateValue = watch("startDate");

  // Reset form when developer changes (switching between create/edit mode)
  useEffect(() => {
    if (open) {
      if (developer) {
        reset({
          name: developer.name,
          email: developer.email,
          role: developer.role,
          team: developer.team || "",
          startDate: developer.startDate,
        });
      } else {
        reset({
          name: "",
          email: "",
          role: undefined,
          team: "",
          startDate: new Date().toISOString().split("T")[0],
        });
      }
    }
  }, [developer, open, reset]);

  const onFormSubmit = async (data: DeveloperFormData) => {
    try {
      if (isEditMode && developer) {
        await onSubmit({
          id: developer.id,
          ...data,
          team: data.team || undefined,
        });
      } else {
        await onSubmit({
          ...data,
          team: data.team || undefined,
        });
      }
      reset();
    } catch (error) {
      console.error("Failed to save developer:", error);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Developer" : "Add Developer"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the developer's information below."
              : "Add a new team member to track their performance."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <TextField
            label="Name"
            placeholder="John Doe"
            {...register("name")}
            error={errors.name?.message}
          />

          <TextField
            label="Email"
            type="email"
            placeholder="john@example.com"
            {...register("email")}
            error={errors.email?.message}
          />

          <DeveloperRoleSelect
            label="Role"
            value={roleValue}
            onChange={(value) => setValue("role", value as DeveloperFormData["role"], { shouldValidate: true })}
            error={errors.role?.message}
          />

          <TextField
            label="Team"
            placeholder="Frontend, Backend, Mobile..."
            {...register("team")}
            error={errors.team?.message}
            description="Optional team or department"
          />

          <EnhancedDateField
            label="Start Date"
            value={startDateValue}
            onChange={(value) => setValue("startDate", value || "", { shouldValidate: true })}
            error={errors.startDate?.message}
            max={new Date().toISOString().split("T")[0]}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditMode
                ? "Save Changes"
                : "Add Developer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

