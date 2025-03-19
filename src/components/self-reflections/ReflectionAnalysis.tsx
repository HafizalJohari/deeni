import { SelfReflection } from '@/types/self-reflections';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface ReflectionAnalysisProps {
  reflections: SelfReflection[];
}

export default function ReflectionAnalysis({ reflections }: ReflectionAnalysisProps) {
  if (!reflections || reflections.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center text-muted-foreground">
          No reflections yet. Start by adding one!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {reflections.map((reflection) => {
        const { id, feeling, feeling_icon, reflection_text, analysis, created_at } = reflection;
        const date = new Date(created_at).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        return (
          <Card key={id} className="w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{feeling_icon}</span>
                <div>
                  <CardTitle>{feeling}</CardTitle>
                  <CardDescription>{date}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Your Reflection</h4>
                <p className="text-muted-foreground">{reflection_text}</p>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="islamic-perspective">
                  <AccordionTrigger>Islamic Perspective</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{analysis.islamicPerspective}</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="recommendations">
                  <AccordionTrigger>Recommendations</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{analysis.recommendations}</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="spiritual-guidance">
                  <AccordionTrigger>Spiritual Guidance</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{analysis.spiritualGuidance}</p>
                  </AccordionContent>
                </AccordionItem>

                {analysis.relevantVerses && analysis.relevantVerses.length > 0 && (
                  <AccordionItem value="relevant-verses">
                    <AccordionTrigger>Relevant Quranic Verses</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-4 space-y-2">
                        {analysis.relevantVerses.map((verse, index) => (
                          <li key={index} className="text-muted-foreground">
                            {verse}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {analysis.relevantHadith && analysis.relevantHadith.length > 0 && (
                  <AccordionItem value="relevant-hadith">
                    <AccordionTrigger>Relevant Hadith</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-4 space-y-2">
                        {analysis.relevantHadith.map((hadith, index) => (
                          <li key={index} className="text-muted-foreground">
                            {hadith}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 