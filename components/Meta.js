import Head from 'next/head';

const Meta = ({ title = 'Next.js app', keywords = '', desc = '', favicon = '' }) => {
	return (
		<Head>
			<title>{title}</title>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			{keywords !== '' ? <meta name="keywords" content={keywords} /> : ''}
			{desc !== '' ? <meta name="description" content={desc} /> : ''}
			{favicon !== '' ? <link rel="icon" href={favicon} /> : ''}
		</Head>
	);
};

export default Meta;
