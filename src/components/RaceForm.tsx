import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { Race, RaceFormData } from "@/types/race";
import { format } from "date-fns";
import { FileUpload } from "./FileUpload";

const raceFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  status: z.enum(["upcoming", "completed", "interest"]),
  raceDate: z.string().min(1, "Data é obrigatória"),
  startTime: z.string().min(1, "Horário é obrigatório"),
  distance: z.number().min(0.1, "Distância deve ser maior que 0"),
  kitPickupAddress: z.string().min(1, "Endereço é obrigatório"),
  kitPickupDates: z.union([
    z.literal("to-be-defined"),
    z.array(z.object({
      date: z.string().min(1, "Data é obrigatória"),
      startTime: z.string().min(1, "Horário inicial é obrigatório"),
      endTime: z.string().min(1, "Horário final é obrigatório"),
    }))
  ]),
  registrationProofUrl: z.string().optional(),
  registrationProofType: z.enum(["file", "link"]).optional(),
  observations: z.string().optional(),
  completionTime: z.string().optional(),
  overallPlacement: z.number().optional(),
  ageGroupPlacement: z.number().optional(),
  shoesUsed: z.string().optional(),
});

interface RaceFormProps {
  race?: Race;
  onSubmit: (data: RaceFormData) => void;
  onCancel: () => void;
}

type KitPickupDateItem = {
  date: string;
  startTime: string;
  endTime: string;
};

// Create a modified form type for internal use where kitPickupDates is always an array
type InternalFormData = Omit<RaceFormData, 'kitPickupDates'> & {
  kitPickupDates: KitPickupDateItem[];
};

export const RaceForm = ({ race, onSubmit, onCancel }: RaceFormProps) => {
  const [toBeDefinedKitPickup, setToBeDefinedKitPickup] = useState(
    race?.kitPickupDates === "to-be-defined"
  );
  const [proofFileName, setProofFileName] = useState(
    race?.registrationProof?.name || ""
  );

  const form = useForm<InternalFormData>({
    resolver: zodResolver(raceFormSchema),
    defaultValues: {
      name: race?.name || "",
      status: race?.status || "upcoming",
      raceDate: race ? format(race.raceDate, "yyyy-MM-dd") : "",
      startTime: race?.startTime || "",
      distance: race?.distance || 0,
      kitPickupAddress: race?.kitPickupAddress || "",
      kitPickupDates: race?.kitPickupDates === "to-be-defined" 
        ? []
        : Array.isArray(race?.kitPickupDates) 
          ? race.kitPickupDates.map(date => ({
              date: format(date.date, "yyyy-MM-dd"),
              startTime: date.startTime,
              endTime: date.endTime,
            }))
          : [],
      registrationProofUrl: race?.registrationProof?.url || "",
      registrationProofType: race?.registrationProof?.type || "link",
      observations: race?.observations || "",
      completionTime: race?.raceResults?.completionTime || "",
      overallPlacement: race?.raceResults?.overallPlacement || undefined,
      ageGroupPlacement: race?.raceResults?.ageGroupPlacement || undefined,
      shoesUsed: race?.raceResults?.shoesUsed || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "kitPickupDates",
  });

  const watchStatus = form.watch("status");
  const watchProofType = form.watch("registrationProofType");

  const handleSubmit = (data: InternalFormData) => {
    // Convert back to RaceFormData format
    const processedData: RaceFormData = {
      ...data,
      distance: Number(data.distance),
      overallPlacement: data.overallPlacement ? Number(data.overallPlacement) : undefined,
      ageGroupPlacement: data.ageGroupPlacement ? Number(data.ageGroupPlacement) : undefined,
      kitPickupDates: toBeDefinedKitPickup ? "to-be-defined" : data.kitPickupDates,
    };
    onSubmit(processedData);
  };

  const handleKitPickupToggle = (checked: boolean) => {
    setToBeDefinedKitPickup(checked);
    if (checked) {
      // Clear the array when switching to "to-be-defined"
      form.setValue("kitPickupDates", []);
    }
  };

  const addKitPickupDate = () => {
    if (!toBeDefinedKitPickup) {
      append({
        date: "",
        startTime: "",
        endTime: "",
      });
    }
  };

  const removeKitPickupDate = (index: number) => {
    remove(index);
  };

  const handleFileUploaded = (url: string, fileName: string) => {
    form.setValue("registrationProofUrl", url);
    setProofFileName(fileName);
  };

  const handleRemoveFile = () => {
    form.setValue("registrationProofUrl", "");
    setProofFileName("");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="running-card">
        <CardHeader>
          <CardTitle>{race ? "Editar Corrida" : "Nova Corrida"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Corrida</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Ex: Corrida de São Silvestre"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(value: "upcoming" | "completed" | "interest") =>
                    form.setValue("status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">A Fazer</SelectItem>
                    <SelectItem value="completed">Realizada</SelectItem>
                    <SelectItem value="interest">Interesse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="raceDate">Data da Corrida</Label>
                  <Input
                    id="raceDate"
                    type="date"
                    {...form.register("raceDate")}
                  />
                  {form.formState.errors.raceDate && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.raceDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="startTime">Horário de Início</Label>
                  <Input
                    id="startTime"
                    type="time"
                    {...form.register("startTime")}
                  />
                  {form.formState.errors.startTime && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.startTime.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="distance">Distância (km)</Label>
                <Input
                  id="distance"
                  type="number"
                  step="0.1"
                  {...form.register("distance", { valueAsNumber: true })}
                  placeholder="Ex: 10"
                />
                {form.formState.errors.distance && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.distance.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="kitPickupAddress">Endereço de Retirada do Kit</Label>
                <Input
                  id="kitPickupAddress"
                  {...form.register("kitPickupAddress")}
                  placeholder="Ex: Shopping Ibirapuera - Piso 2"
                />
                {form.formState.errors.kitPickupAddress && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.kitPickupAddress.message}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="toBeDefinedKitPickup"
                    checked={toBeDefinedKitPickup}
                    onCheckedChange={handleKitPickupToggle}
                  />
                  <Label htmlFor="toBeDefinedKitPickup">
                    Datas de retirada do kit a definir
                  </Label>
                </div>

                {!toBeDefinedKitPickup && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Datas de Retirada do Kit</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addKitPickupDate}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Data
                      </Button>
                    </div>

                    {fields.map((field, index) => (
                      <Card key={field.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`kitPickupDates.${index}.date`}>Data</Label>
                            <Input
                              type="date"
                              {...form.register(`kitPickupDates.${index}.date` as const)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`kitPickupDates.${index}.startTime`}>Horário Início</Label>
                            <Input
                              type="time"
                              {...form.register(`kitPickupDates.${index}.startTime` as const)}
                            />
                          </div>
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <Label htmlFor={`kitPickupDates.${index}.endTime`}>Horário Fim</Label>
                              <Input
                                type="time"
                                {...form.register(`kitPickupDates.${index}.endTime` as const)}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeKitPickupDate(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="registrationProofType">Tipo de Comprovante</Label>
                  <Select
                    value={form.watch("registrationProofType")}
                    onValueChange={(value: "file" | "link") =>
                      form.setValue("registrationProofType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="file">Arquivo</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {watchProofType === "file" ? (
                  <FileUpload
                    onFileUploaded={handleFileUploaded}
                    currentFile={
                      form.watch("registrationProofUrl") 
                        ? { 
                            url: form.watch("registrationProofUrl") || "", 
                            name: proofFileName 
                          }
                        : undefined
                    }
                    onRemoveFile={handleRemoveFile}
                  />
                ) : watchProofType === "link" ? (
                  <div>
                    <Label htmlFor="registrationProofUrl">Link do Comprovante</Label>
                    <Input
                      id="registrationProofUrl"
                      {...form.register("registrationProofUrl")}
                      placeholder="Link do comprovante"
                    />
                  </div>
                ) : null}
              </div>

              {watchStatus === "completed" && (
                <Card className="p-4 bg-green-50 border-green-200">
                  <h3 className="font-semibold text-green-800 mb-4">Resultados da Corrida</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="completionTime">Tempo de Conclusão</Label>
                      <Input
                        id="completionTime"
                        {...form.register("completionTime")}
                        placeholder="Ex: 01:30:45"
                        pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                      />
                    </div>

                    <div>
                      <Label htmlFor="overallPlacement">Colocação Geral</Label>
                      <Input
                        id="overallPlacement"
                        type="number"
                        {...form.register("overallPlacement", { valueAsNumber: true })}
                        placeholder="Ex: 150"
                      />
                    </div>

                    <div>
                      <Label htmlFor="ageGroupPlacement">Colocação por Faixa Etária</Label>
                      <Input
                        id="ageGroupPlacement"
                        type="number"
                        {...form.register("ageGroupPlacement", { valueAsNumber: true })}
                        placeholder="Ex: 15"
                      />
                    </div>

                    <div>
                      <Label htmlFor="shoesUsed">Tênis Usado</Label>
                      <Input
                        id="shoesUsed"
                        {...form.register("shoesUsed")}
                        placeholder="Ex: Nike Air Zoom Pegasus 40"
                      />
                    </div>
                  </div>
                </Card>
              )}

              <div>
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  {...form.register("observations")}
                  placeholder="Observações adicionais sobre a corrida..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="running-gradient text-white">
                {race ? "Atualizar Corrida" : "Criar Corrida"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
