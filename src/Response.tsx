import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ResponseProps {
  response: string;
  loading: boolean;
  markdownEnabled: boolean;
}

const Response: React.FC<ResponseProps> = ({
  response,
  loading,
  markdownEnabled,
}) => {
  return (
    <div className="relative flex-grow">
      <div
        id="response"
        className={`prose prose-sm prose-invert p-2.5 w-full text-white bg-gray-700 rounded-lg border border-gray-600 min-h-[100px] ${
          loading ? "blur-sm" : ""
        }`}
      >
        {markdownEnabled ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              pre: ({ node, ...props }) => (
                <pre className="bg-gray-800 rounded-md p-2" {...props} />
              ),
              code: ({ node, ...props }) => (
                <code className="bg-gray-800 rounded-md px-1" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-5" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-5" {...props} />
              ),
            }}
          >
            {response}
          </ReactMarkdown>
        ) : (
          <pre className="text-sm whitespace-pre-wrap">{response}</pre>
        )}
      </div>
      {loading && (
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
};

export default Response;
