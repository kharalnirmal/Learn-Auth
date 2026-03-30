"use client";

import Link from "next/link";

export default function Page() {
  return (
    <div
      className="flex justify-center items-center p-4 min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #E1F5EE 0%, #ffffff 50%, #5DCAA5 100%)",
      }}
    >
      <div className="space-y-8 w-full max-w-2xl">
        {/* Header */}
        <div className="space-y-4 text-center">
          <h1 className="font-bold text-5xl" style={{ color: "#04342C" }}>
            Auth <span style={{ color: "#1D9E75" }}>Master</span>
          </h1>
          <p className="text-xl" style={{ color: "#0F6E56" }}>
            Master the art of authentication
          </p>
        </div>

        {/* Main Content */}
        <div
          className="space-y-6 shadow-2xl p-8 border rounded-lg"
          style={{
            background: "rgba(255,255,255,0.85)",
            borderColor: "#9FE1CB",
          }}
        >
          <div className="space-y-4">
            <h2 className="font-semibold text-2xl" style={{ color: "#04342C" }}>
              Welcome to Authentication Mastery
            </h2>
            <p className="leading-relaxed" style={{ color: "#0F6E56" }}>
              This is your gateway to understanding and implementing secure
              authentication systems. Whether you're building a personal project
              or an enterprise application, learn best practices and industry
              standards.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex sm:flex-row flex-col gap-4 pt-4">
            <Link
              href="/login"
              className="flex-1 px-6 py-3 rounded-lg font-semibold text-white text-center transition duration-300"
              style={{ background: "#1D9E75" }}
            >
              Try Login
            </Link>
            <a
              href="https://github.com/kharalnirmal/Learn-Auth"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3 rounded-lg font-semibold text-white text-center transition duration-300"
              style={{ background: "#0F6E56" }}
            >
              GitHub
            </a>
          </div>

          {/* Info Section */}
          <div
            className="space-y-2 mt-6 p-4 rounded-lg"
            style={{ background: "#EAF7F1" }}
          >
            <h3 className="font-semibold" style={{ color: "#085041" }}>
              Quick Tips:
            </h3>
            <ul className="space-y-1 text-sm" style={{ color: "#0F6E56" }}>
              <li>✓ Explore secure authentication patterns</li>
              <li>✓ Check the GitHub repository for detailed code</li>
              <li>✓ Learn and grow with hands-on examples</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-sm text-center" style={{ color: "#0F6E56" }}>
          <p>Built with ❤️ for developers who want to grow</p>
        </div>
      </div>
    </div>
  );
}
