import PageLayout from '../../components/PageLayout'
import css from '../../scss/page.module.scss'

export default function Radio() {
	return (
		<PageLayout title="Radio">
			<p>That's it, a radio, with 5 stations and over 600 songs!</p>
			<a href="/radio" target="_blank" className={css['go-link']}>
				Check it out
			</a>
		</PageLayout>
	)
}
