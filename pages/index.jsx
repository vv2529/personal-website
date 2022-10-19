import PageContainer from '../components/PageContainer'
import { FaYoutube, FaDiscord, FaGithub } from 'react-icons/fa'
import { SiGmail } from 'react-icons/si'
import ReactMarkdown from 'react-markdown'
import { useEffect, useState } from 'react'
import { fetchFromAPI } from '../scripts/functions'
import css from '../scss/page.module.scss'

const Markdown = (props) => (
	<ReactMarkdown
		components={{
			p: 'span',
		}}
		{...props}
	/>
)

let newsLoaded = false
let news = []

const News = () => {
	const [_news, setNews] = useState(news)

	useEffect(() => {
		if (newsLoaded) return

		newsLoaded = true
		let unmounted = false

		fetchFromAPI('home/news').then((response) => {
			if (response && !unmounted) {
				news = response
				setNews(response)
			}
		})

		return () => (unmounted = true)
	})

	return (
		<ul className={`${css['section-content']} ${css['news-list']}`}>
			{news.length === 0 ? '...' : news.map((newsItem, i) => <NewsItem key={i} {...newsItem} />)}
		</ul>
	)
}

const NewsItem = ({ date, text }) => (
	<li className={css['news-item']}>
		<time className={css['news-time']}>{date}</time>
		<div className={css['news-text']}>
			<Markdown>{text}</Markdown>
		</div>
	</li>
)

export default function Home() {
	return (
		<PageContainer title="vv2529">
			<div className={`${css['section']} ${css['topmost']}`}>
				<div className={css['section-headline']}>
					<span className="big-text">Hi!</span>
				</div>
				<div className={`${css['section-content']} ${css['offset']}`}>
					<p>I'm Vlad, also known as vv2529 and Motch, welcome to my website!</p>
					<p>Feel free to look around, perhaps you'll find something interesting.</p>
				</div>
			</div>
			<div className={`${css['section']} ${css['contacts']}`}>
				<div className={css['section-headline']}>My contacts</div>
				<ul className={`${css['section-content']} ${css['contacts-list']}`}>
					<li className={css['contacts-item']}>
						<FaYoutube className={css['contacts-item-icon']} />
						<a
							className={css['contacts-item-link']}
							href="https://youtube.com/channel/UCF6FE8A6PXO2c6eo5o9_LPg"
							target="_blank"
						>
							Motch
						</a>
					</li>
					<li className={css['contacts-item']}>
						<FaDiscord className={css['contacts-item-icon']} />
						Motch#6336
					</li>
					<li className={css['contacts-item']}>
						<SiGmail className={css['contacts-item-icon']} />
						<a className="contacts-item-link" href="mailto:vv02529@gmail.com">
							vv02529
						</a>
					</li>
					<li className={css['contacts-item']}>
						<FaGithub className={css['contacts-item-icon']} />
						<a className="contacts-item-link" href="https://github.com/vv2529" target="_blank">
							vv2529
						</a>
					</li>
				</ul>
			</div>
			<div className={`${css['section']} ${css['news']}`}>
				<div className={css['section-headline']}>News</div>
				<News />
			</div>
		</PageContainer>
	)
}
