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
        className={`prose prose-sm p-2.5 w-full text-white bg-gray-700 rounded-lg border border-gray-600 min-h-[100px] ${
          loading ? "blur-sm" : ""
        }`}
      >
        {markdownEnabled ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ node, ...props }) => (
                <h4 className="text-lg font-bold" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h5 className="text-base font-bold" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h6 className="text-sm font-bold" {...props} />
              ),
              h4: ({ node, ...props }) => (
                <h6 className="text-sm font-bold" {...props} />
              ),
              h5: ({ node, ...props }) => (
                <h6 className="text-sm font-bold" {...props} />
              ),
              h6: ({ node, ...props }) => (
                <h6 className="text-sm font-bold" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a
                  className="text-blue-400 hover:underline"
                  {...props}
                  target="_blank"
                />
              ),
              code: ({ node, ...props }) => (
                <code className="text-sm bg-gray-800 p-1 rounded" {...props} />
              ),
              pre: ({ node, ...props }) => (
                <pre className="text-sm bg-gray-800 p-2 rounded" {...props} />
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
