import React from 'react';

const Footer: React.FC = () => {
  const whatsappMessage = encodeURIComponent("Hi, I'm interested in a custom market analysis for my business. Can we schedule a discussion?");
  const whatsappLink = `https://api.whatsapp.com/send/?phone=6285330168811&text=${whatsappMessage}&type=phone_number&app_absent=0`;

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-slate-50/70 backdrop-blur-lg z-20 border-t border-slate-900/10 dark:bg-slate-900/70 dark:border-slate-50/[0.06]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-3">
        <div className="flex flex-col sm:flex-row justify-center items-center text-center sm:text-left">
          <p className="text-sm text-slate-500 dark:text-slate-400 sm:mr-4 mb-2 sm:mb-0">
            Need a deeper, personalized market analysis?
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 focus:ring-sky-500 transition-all duration-200 dark:focus:ring-offset-slate-900"
          >
            Get Custom Insights
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;