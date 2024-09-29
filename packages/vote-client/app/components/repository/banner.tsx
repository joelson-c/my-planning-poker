import { Github } from "../icons/github";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export function RepositoryBanner() {
  return (
    <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <CardContent className="flex flex-col sm:flex-row items-center justify-between p-6">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-xl font-bold mb-2">Enjoying Planning Poker?</h2>
          <p className="text-sm opacity-90">
            Star our GitHub repository and contribute to make it even better!
          </p>
        </div>
        <Button
          variant="secondary"
          className="bg-white text-blue-600 hover:bg-blue-100"
          asChild
        >
          <a
            href="https://github.com/joelson-c/my-planning-poker"
            target="_blank"
            rel="noreferrer"
          >
            <Github className="mr-2 h-4 w-4" />
            Star on GitHub
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
