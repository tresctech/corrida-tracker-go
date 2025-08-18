
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, FileText, ExternalLink, Edit, X, Route, Trophy, Timer, Award, Footprints } from "lucide-react";
import { Race } from "@/types/race";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RaceDetailsProps {
  race: Race;
  onEdit: () => void;
  onClose: () => void;
}

export const RaceDetails = ({ race, onEdit, onClose }: RaceDetailsProps) => {
  return (
    <Card className="running-card max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-2xl">{race.name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="outline" 
                className={
                  race.status === "upcoming" 
                    ? "bg-running-primary/10 text-running-primary border-running-primary/20" 
                    : race.status === "completed"
                    ? "bg-running-secondary/10 text-running-secondary border-running-secondary/20"
                    : "bg-running-accent/10 text-running-accent border-running-accent/20"
                }
              >
                {race.status === "upcoming" ? "A Fazer" : race.status === "completed" ? "Realizada" : "Interesse"}
              </Badge>
              <Badge variant="secondary" className="bg-running-accent/10 text-running-accent border-running-accent/20">
                <Route className="w-3 h-3 mr-1" />
                {race.distance} km
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Data e Horário da Corrida */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Informações da Corrida</h3>
          <div className="bg-running-primary/10 p-4 rounded-lg space-y-2 border border-running-primary/20">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-running-primary" />
              <div>
                <p className="font-medium text-foreground">Data da Corrida</p>
                <p className="text-muted-foreground">
                  {format(race.raceDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-running-primary" />
              <div>
                <p className="font-medium text-foreground">Horário de Largada</p>
                <p className="text-muted-foreground">{race.startTime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resultados da Corrida - só aparece se status for "completed" e tiver resultados */}
        {race.status === 'completed' && race.raceResults && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-running-accent" />
                Resultados da Corrida
              </h3>
              <div className="bg-running-accent/10 p-4 rounded-lg space-y-3 border border-running-accent/20">
                {race.raceResults.completionTime && (
                  <div className="flex items-center gap-3">
                    <Timer className="w-5 h-5 text-running-accent" />
                    <div>
                      <p className="font-medium text-foreground">Tempo de Conclusão</p>
                      <p className="text-muted-foreground text-lg font-mono">{race.raceResults.completionTime}</p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {race.raceResults.overallPlacement && (
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-running-accent" />
                      <div>
                        <p className="font-medium text-foreground">Colocação Geral</p>
                        <p className="text-muted-foreground">{race.raceResults.overallPlacement}º lugar</p>
                      </div>
                    </div>
                  )}
                  
                  {race.raceResults.ageGroupPlacement && (
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-running-accent" />
                      <div>
                        <p className="font-medium text-foreground">Colocação por Faixa Etária</p>
                        <p className="text-muted-foreground">{race.raceResults.ageGroupPlacement}º lugar</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {race.raceResults.shoesUsed && (
                  <div className="flex items-center gap-3">
                    <Footprints className="w-5 h-5 text-running-accent" />
                    <div>
                      <p className="font-medium text-foreground">Tênis Usado</p>
                      <p className="text-muted-foreground">{race.raceResults.shoesUsed}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Retirada do Kit */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Retirada do Kit</h3>
          <div className="bg-running-secondary/10 p-4 rounded-lg space-y-3 border border-running-secondary/20">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-running-secondary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Local</p>
                <p className="text-muted-foreground">{race.kitPickupAddress}</p>
              </div>
            </div>
            
            {race.kitPickupDates === 'to-be-defined' ? (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-running-accent" />
                <div>
                  <p className="font-medium text-foreground">Datas e Horários</p>
                  <p className="text-muted-foreground">A definir</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-running-secondary" />
                  <p className="font-medium text-foreground">Datas e Horários Disponíveis</p>
                </div>
                <div className="ml-8 space-y-1">
                  {race.kitPickupDates.map((pickup, index) => (
                    <p key={index} className="text-muted-foreground">
                      {format(pickup.date, "dd/MM/yyyy")} de {pickup.startTime} até {pickup.endTime}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comprovante de Inscrição */}
        {race.registrationProof && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Comprovante de Inscrição</h3>
              <div className="bg-card/50 p-4 rounded-lg border">
                <Button
                  variant="outline"
                  onClick={() => window.open(race.registrationProof!.url, "_blank")}
                  className="w-full justify-start"
                >
                  {race.registrationProof.type === "file" ? (
                    <FileText className="w-4 h-4 mr-2 text-running-primary" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2 text-running-primary" />
                  )}
                  {race.registrationProof.type === "file" 
                    ? "Ver Arquivo" 
                    : "Abrir Link"
                  }
                </Button>
              </div>
            </div>
          </>
        )}

        {race.observations && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Observações</h3>
              <div className="bg-running-accent/10 p-4 rounded-lg border border-running-accent/20">
                <p className="text-foreground whitespace-pre-wrap">{race.observations}</p>
              </div>
            </div>
          </>
        )}

        <Separator />
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Criado em: {format(race.createdAt, "dd/MM/yyyy 'às' HH:mm")}</p>
          {race.updatedAt.getTime() !== race.createdAt.getTime() && (
            <p>Última atualização: {format(race.updatedAt, "dd/MM/yyyy 'às' HH:mm")}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
